namespace Api.Controllers;

// Controller : API endpoint(POST / GET), Class to process the HTTP request
using Api.Data;
// to use AppDbContext.cs file (DbContext is the database connection class - used to access the database )
using Api.Dtos.Orders;
// allows the controller to use OrderRequest.cs file
using Api.Models;
// allows the controller to use the order model
using Api.Utils;
// import utils helpers
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
// Provides ASP.NET Core API features ( [HttpGet] , ..)
using Microsoft.EntityFrameworkCore;

[Authorize(Policy = "AdminOnly")] 
[ApiController]
[Route("api/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public AdminOrdersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<object>> List([FromQuery] OrderStatus? status = null)
    {
        var q = _db.Orders
            .AsNoTracking()
            .Include(o => o.Customer)
            .AsQueryable();

        if (status != null)
            q = q.Where(o => o.Status == status);

        var list = await q
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                id = o.Id,
                status = o.Status.ToString(),            
                createdAt = o.CreatedAt,
                pickupAt = o.PickupAt,                  
                totalCents = o.TotalCents,
                customerName =
                    ((o.Customer != null ? o.Customer.FirstName : "") + " " +
                     (o.Customer != null ? o.Customer.LastName : "")).Trim()
            })
            .Take(200)
            .ToListAsync();

        return Ok(list);
    }

    public class UpdateStatusDto
    {
        public OrderStatus Status { get; set; }
    }

    // PATCH /api/admin/orders/{id}/status
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult> UpdateStatus([FromRoute] Guid id, [FromBody] UpdateStatusDto dto)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();

        order.Status = dto.Status;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/admin/orders/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> GetOne([FromRoute] Guid id)
    {
        var o = await _db.Orders
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.LineItems)
                .ThenInclude(li => li.Options)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (o == null) return NotFound();

        return Ok(new
        {
            id = o.Id,
            status = o.Status.ToString(),                
            currency = o.Currency,
            paymentStatus = o.PaymentStatus.ToString(),   
            payMethod = o.PayMethod.ToString(),          
            subtotalCents = o.SubtotalCents,
            taxCents = o.TaxCents,
            totalCents = o.TotalCents,
            createdAt = o.CreatedAt,
            pickupAt = o.PickupAt,
            customer = new
            {
                firstName = o.Customer?.FirstName ?? "",
                lastName = o.Customer?.LastName ?? "",
                phone = o.Customer?.Phone ?? "",
                email = o.Customer?.Email ?? "",
                note = o.Customer?.Note
            },
            lineItems = o.LineItems
                .OrderBy(li => li.Id)
                .Select(li => new
                {
                    id = li.Id,
                    orderId = li.OrderId,
                    menuItemId = li.MenuItemId,
                    itemNameSnapshot = li.ItemNameSnapshot,
                    itemImageUrlSnapshot = li.ItemImageUrlSnapshot,
                    unitBasePriceCentsSnapshot = li.UnitBasePriceCentsSnapshot,
                    currency = li.Currency,
                    qty = li.Qty,
                    note = li.Note,
                    lineSubtotalCentsSnapshot = li.LineSubtotalCentsSnapshot,
                    options = li.Options
                        .OrderBy(x => x.Id)
                        .Select(op => new
                        {
                            id = op.Id,
                            orderLineItemId = op.OrderLineItemId,
                            groupId = op.GroupId,
                            groupTitleSnapshot = op.GroupTitleSnapshot,
                            optionId = op.OptionId,
                            optionNameSnapshot = op.OptionNameSnapshot,
                            unitPriceDeltaCentsSnapshot = op.UnitPriceDeltaCentsSnapshot,
                            qty = op.Qty
                        })
                })
        });
    }
}