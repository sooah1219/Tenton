using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

var builder = WebApplication.CreateBuilder(args);

// Controllers (optional - keep if you plan to add controllers later)
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (Next.js dev server)
builder.Services.AddCors(options =>
{
    options.AddPolicy("WebPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ✅ EF Core (Postgres)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("WebPolicy");

// ---------- Health ----------
app.MapGet("/health", () => Results.Ok(new { ok = true }));

app.MapGet("/db/health", async (AppDbContext db) =>
{
    try
    {
        var ok = await db.Database.CanConnectAsync();
        return Results.Ok(new { ok });
    }
    catch (Exception ex)
    {
        return Results.Problem($"DB connection failed: {ex.GetType().Name}: {ex.Message}");
    }
});

// ---------- Reservations ----------
app.MapPost("/reservations", async (AppDbContext db, CreateReservationDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name)) return Results.BadRequest("Name required");
    if (string.IsNullOrWhiteSpace(dto.Phone)) return Results.BadRequest("Phone required");
    if (dto.PartySize <= 0) return Results.BadRequest("PartySize must be > 0");
    if (dto.ReservedAt == default) return Results.BadRequest("ReservedAt required");

    var r = new Reservation
    {
        Name = dto.Name.Trim(),
        Phone = dto.Phone.Trim(),
        PartySize = dto.PartySize,
        ReservedAt = dto.ReservedAt,
        Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim(),
        Status = "confirmed",
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow
    };

    db.Reservations.Add(r);
    await db.SaveChangesAsync();

    return Results.Ok(new { ok = true, id = r.Id });
});

app.MapGet("/reservations", async (AppDbContext db, string? status, int limit = 50) =>
{
    limit = Math.Clamp(limit, 1, 200);

    var q = db.Reservations.AsNoTracking();

    if (!string.IsNullOrWhiteSpace(status))
        q = q.Where(r => r.Status == status);

    var list = await q.OrderByDescending(r => r.ReservedAt)
                      .Take(limit)
                      .Select(r => new ReservationDto(
                          r.Id,
                          r.Name,
                          r.Phone,
                          r.PartySize,
                          r.ReservedAt,
                          r.Status,
                          r.CreatedAt,
                          r.Note
                      ))
                      .ToListAsync();

    return Results.Ok(list);
});

// ---------- Orders ----------
app.MapPost("/orders", async (AppDbContext db, CreateOrderDto dto) =>
{
    if (dto.Items == null || dto.Items.Count == 0) return Results.BadRequest("Items required");
    if (dto.Items.Any(i => string.IsNullOrWhiteSpace(i.ItemName))) return Results.BadRequest("Each item needs itemName");
    if (dto.Items.Any(i => i.Quantity <= 0)) return Results.BadRequest("Quantity must be > 0");
    if (dto.Items.Any(i => i.UnitPriceCents < 0)) return Results.BadRequest("UnitPriceCents must be >= 0");

    var subtotal = dto.Items.Sum(i => i.UnitPriceCents * i.Quantity);
    var tax = 0; // need to add 5% GST
    var total = subtotal + tax;

    
    await using var tx = await db.Database.BeginTransactionAsync();
    try
    {
        var order = new Order
        {
            CustomerName = string.IsNullOrWhiteSpace(dto.CustomerName) ? null : dto.CustomerName.Trim(),
            CustomerPhone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
            OrderType = string.IsNullOrWhiteSpace(dto.OrderType) ? "dine_in" : dto.OrderType,
            Status = "pending",
            Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim(),
            SubtotalCents = subtotal,
            TaxCents = tax,
            TotalCents = total,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            Items = dto.Items.Select(i => new OrderItem
            {
                MenuItemId = i.MenuItemId,
                ItemName = i.ItemName.Trim(),
                UnitPriceCents = i.UnitPriceCents,
                Quantity = i.Quantity,
                LineTotalCents = i.UnitPriceCents * i.Quantity,
                CreatedAt = DateTimeOffset.UtcNow
            }).ToList()
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        await tx.CommitAsync();

        return Results.Ok(new { ok = true, id = order.Id, totalCents = total });
    }
    catch (Exception ex)
    {
        await tx.RollbackAsync();
        return Results.Problem($"Failed to create order: {ex.GetType().Name}: {ex.Message}");
    }
});

app.MapGet("/orders", async (AppDbContext db, string? status, int limit = 50) =>
{
    limit = Math.Clamp(limit, 1, 200);

    var q = db.Orders.AsNoTracking();

    if (!string.IsNullOrWhiteSpace(status))
        q = q.Where(o => o.Status == status);

    var list = await q.OrderByDescending(o => o.CreatedAt)
                      .Take(limit)
                      .Select(o => new OrderListDto(
                          o.Id,
                          o.Status,
                          o.OrderType,
                          o.TotalCents,
                          o.CreatedAt
                      ))
                      .ToListAsync();

    return Results.Ok(list);
});

static bool IsValidStatusTransition(string current, string next)
{
    current = current.ToLower();
    next = next.ToLower();

    return current switch
    {
        "pending"   => next is "accepted" or "cancelled",
        "accepted"  => next is "cooking" or "cancelled",
        "cooking"   => next is "ready",
        "ready"     => next is "completed",
        _           => false
    };
}

app.MapPatch("/orders/{id:guid}/status", async (
    AppDbContext db,
    Guid id,
    UpdateOrderStatusDto dto
) =>
{
    var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == id);
    if (order == null)
        return Results.NotFound("Order not found");

    var next = dto.Status?.Trim().ToLower();
    if (string.IsNullOrWhiteSpace(next))
        return Results.BadRequest("Status is required");

    var allowed = IsValidStatusTransition(order.Status, next);
    if (!allowed)
        return Results.BadRequest(
            $"Invalid status transition: {order.Status} → {next}"
        );

    order.Status = next;
    order.UpdatedAt = DateTimeOffset.UtcNow;

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        ok = true,
        id = order.Id,
        status = order.Status
    });
});

app.MapGet("/debug/order-mapping", (AppDbContext db) =>
{
    var et = db.Model.FindEntityType(typeof(Order))!;
    var table = et.GetTableName();
    var cols = et.GetProperties()
        .Select(p => new {
            prop = p.Name,
            column = p.GetColumnName(StoreObjectIdentifier.Table(table!, null))
        });

    return Results.Ok(cols);
});



// Controllers (optional)
app.MapControllers();

app.Run();


// ---------------- DTOs ----------------
record CreateReservationDto(string Name, string Phone, int PartySize, DateTimeOffset ReservedAt, string? Note);
record ReservationDto(Guid Id, string Name, string Phone, int PartySize, DateTimeOffset ReservedAt, string Status, DateTimeOffset CreatedAt, string? Note);

record CreateOrderItemDto(Guid? MenuItemId, string ItemName, int UnitPriceCents, int Quantity);
record CreateOrderDto(string? CustomerName, string? Phone, string OrderType, string? Note, List<CreateOrderItemDto> Items);
record OrderListDto(Guid Id, string Status, string OrderType, int TotalCents, DateTimeOffset CreatedAt);

record UpdateOrderStatusDto(string Status);


