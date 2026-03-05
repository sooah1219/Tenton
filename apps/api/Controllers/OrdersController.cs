namespace Api.Controllers;

using Api.Data;
using Api.Dtos.Orders;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) => _db = db;

    // GET /api/orders?limit=50
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetAll([FromQuery] int limit = 50)
    {
        if (limit < 1) limit = 1;
        if (limit > 200) limit = 200;

        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.LineItems)
                .ThenInclude(li => li.Options)
            .OrderByDescending(o => o.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var dtos = orders.Select(ToOrderDto).ToList();
        return Ok(dtos);
    }

    // GET /api/orders/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById([FromRoute] string id)
    {
        if (!Guid.TryParse(id, out var gid))
            return BadRequest("Invalid order id.");

        var order = await _db.Orders
            .AsNoTracking()
            .Include(o => o.LineItems)
                .ThenInclude(li => li.Options)
            .FirstOrDefaultAsync(o => o.Id == gid);

        if (order == null) return NotFound();

        return Ok(ToOrderDto(order));
    }

    // POST /api/orders
    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] CreateOrderRequestDto req)
    {
        if (req.Items == null || req.Items.Count == 0)
            return BadRequest("No items.");

    var payMethodRaw = (req.PayMethod ?? "store").Trim().ToLowerInvariant();
    var payMethod = payMethodRaw == "card" ? PayMethod.card : PayMethod.store;

    var menuItemIds = req.Items
            .Select(x => (x.MenuItemId ?? "").Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .ToList();

        if (menuItemIds.Count == 0)
            return BadRequest("menuItemId is required.");

        var menuItems = await _db.MenuItems
            .Where(m => menuItemIds.Contains(m.Id) && m.IsActive)
            .ToDictionaryAsync(x => x.Id);

     
        var optionIds = req.Items
            .Where(i => i.Ramen != null)
            .SelectMany(i =>
                new[] { i.Ramen!.ProteinOptionId, i.Ramen!.NoodleOptionId }
                    .Concat(i.Ramen!.Toppings.Select(t => t.OptionId))
            )
            .Select(x => (x ?? "").Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .ToList();

        var options = optionIds.Count == 0
            ? new Dictionary<string, Option>()
            : await _db.Options
                .Include(o => o.Group)
                .Where(o => optionIds.Contains(o.Id) && o.IsActive)
                .ToDictionaryAsync(o => o.Id);

      
        var order = new Order
        {
            Status = OrderStatus.CONFIRMED,
            PickupAt = req.PickupAt,

            PayMethod = payMethod,
            PaymentStatus = payMethod == PayMethod.card ? PaymentStatus.PAID : PaymentStatus.UNPAID,

            Customer = new CustomerInfo
            {
                FirstName = (req.Customer.FirstName ?? "").Trim(),
                LastName  = (req.Customer.LastName ?? "").Trim(),
                Phone     = (req.Customer.Phone ?? "").Trim(),
                Email     = (req.Customer.Email ?? "").Trim(),
                Note      = string.IsNullOrWhiteSpace(req.Customer.Note) ? null : req.Customer.Note.Trim()
            },
            Currency = Currency.CAD
        };

        int subtotal = 0;

        foreach (var it in req.Items)
        {
            var menuItemId = (it.MenuItemId ?? "").Trim();
            if (string.IsNullOrWhiteSpace(menuItemId))
                return BadRequest("menuItemId is required.");

            if (!menuItems.TryGetValue(menuItemId, out var menu))
                return BadRequest($"Invalid menuItemId: {menuItemId}");

            if (it.Qty < 1 || it.Qty > 50)
                return BadRequest("Invalid qty.");

            var baseUnit = menu.PriceCents;
            var lineOptions = new List<OrderLineOption>();
            int extraPerUnit = 0;

            if (it.Ramen != null)
            {
                var proteinId = (it.Ramen.ProteinOptionId ?? "").Trim();
                var noodleId  = (it.Ramen.NoodleOptionId ?? "").Trim();

                if (string.IsNullOrWhiteSpace(proteinId) || !options.TryGetValue(proteinId, out var protein))
                    return BadRequest("Invalid protein option.");

                if (string.IsNullOrWhiteSpace(noodleId) || !options.TryGetValue(noodleId, out var noodle))
                    return BadRequest("Invalid noodle option.");

                lineOptions.Add(new OrderLineOption
                {
                    GroupId = protein.GroupId,
                    GroupTitleSnapshot = protein.Group?.Title ?? "",
                    OptionId = protein.Id,
                    OptionNameSnapshot = protein.Name,
                    UnitPriceDeltaCentsSnapshot = protein.PriceDeltaCents,
                    Qty = 1
                });

              
                lineOptions.Add(new OrderLineOption
                {
                    GroupId = noodle.GroupId,
                    GroupTitleSnapshot = noodle.Group?.Title ?? "",
                    OptionId = noodle.Id,
                    OptionNameSnapshot = noodle.Name,
                    UnitPriceDeltaCentsSnapshot = noodle.PriceDeltaCents,
                    Qty = 1
                });

           
                foreach (var t in it.Ramen.Toppings)
                {
                    var optId = (t.OptionId ?? "").Trim();
                    if (string.IsNullOrWhiteSpace(optId))
                        return BadRequest("Invalid topping option.");

                    if (t.Qty < 1 || t.Qty > 20)
                        return BadRequest("Invalid topping qty.");

                    if (!options.TryGetValue(optId, out var top))
                        return BadRequest("Invalid topping option.");

                    extraPerUnit += top.PriceDeltaCents * t.Qty;

                    lineOptions.Add(new OrderLineOption
                    {
                        GroupId = top.GroupId,
                        GroupTitleSnapshot = top.Group?.Title ?? "",
                        OptionId = top.Id,
                        OptionNameSnapshot = top.Name,
                        UnitPriceDeltaCentsSnapshot = top.PriceDeltaCents,
                        Qty = t.Qty
                    });
                }
            }

            var unitTotal = baseUnit + extraPerUnit;
            var lineSubtotal = unitTotal * it.Qty;

            var line = new OrderLineItem
            {
                MenuItemId = menu.Id,
                ItemNameSnapshot = menu.Name,
                ItemImageUrlSnapshot = menu.ImageUrl,
                UnitBasePriceCentsSnapshot = baseUnit,
                Currency = menu.Currency,
                Qty = it.Qty,
                Note = string.IsNullOrWhiteSpace(it.Note) ? null : it.Note.Trim(),
                LineSubtotalCentsSnapshot = lineSubtotal,
                Options = lineOptions
            };

            order.LineItems.Add(line);
            subtotal += lineSubtotal;
        }

        var tax = (int)Math.Round(subtotal * 0.05m);
        var total = subtotal + tax;

        order.SubtotalCents = subtotal;
        order.TaxCents = tax;
        order.TotalCents = total;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return Ok(new { orderId = order.Id });
    }

    private static OrderDto ToOrderDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id.ToString(),
            Status = order.Status.ToString(),
            Currency = order.Currency.ToString(),
            PaymentStatus = order.PaymentStatus.ToString(),
            PayMethod = order.PayMethod.ToString(),

            SubtotalCents = order.SubtotalCents,
            TaxCents = order.TaxCents,
            TotalCents = order.TotalCents,
            CreatedAt = order.CreatedAt,
            PickupAt = order.PickupAt,

            Customer = new CustomerInfoDto
            {
                FirstName = order.Customer.FirstName,
                LastName  = order.Customer.LastName,
                Phone     = order.Customer.Phone,
                Email     = order.Customer.Email,
                Note      = order.Customer.Note
            },

            LineItems = order.LineItems.Select(li => new OrderLineItemDto
            {
                Id = li.Id.ToString(),
                OrderId = li.OrderId.ToString(),
                MenuItemId = li.MenuItemId,

                ItemNameSnapshot = li.ItemNameSnapshot,
                ItemImageUrlSnapshot = li.ItemImageUrlSnapshot,

                UnitBasePriceCentsSnapshot = li.UnitBasePriceCentsSnapshot,
                Currency = li.Currency.ToString(),

                Qty = li.Qty,
                Note = li.Note,

                LineSubtotalCentsSnapshot = li.LineSubtotalCentsSnapshot,

                Options = li.Options.Select(op => new OrderLineOptionDto
                {
                    Id = op.Id.ToString(),
                    OrderLineItemId = op.OrderLineItemId.ToString(),

                    GroupId = op.GroupId,
                    GroupTitleSnapshot = op.GroupTitleSnapshot,

                    OptionId = op.OptionId,
                    OptionNameSnapshot = op.OptionNameSnapshot,

                    UnitPriceDeltaCentsSnapshot = op.UnitPriceDeltaCentsSnapshot,
                    Qty = op.Qty
                }).ToList()
            }).ToList()
        };
    }
}