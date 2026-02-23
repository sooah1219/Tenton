public class OrderItem
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }
    public Order? Order { get; set; }

    public Guid? MenuItemId { get; set; }

    public string ItemName { get; set; } = "";
    public int UnitPriceCents { get; set; }
    public int Quantity { get; set; }
    public int LineTotalCents { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
