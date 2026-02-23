using System.ComponentModel.DataAnnotations;

public class Order
{
    public Guid Id { get; set; }

    public long OrderNo { get; set; } // bigserial

    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }

    [MaxLength(20)]
    public string OrderType { get; set; } = "dine_in";

    [MaxLength(20)]
    public string Status { get; set; } = "pending";

    public string? Note { get; set; }

    public int SubtotalCents { get; set; }
    public int TaxCents { get; set; }
    public int TotalCents { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public List<OrderItem> Items { get; set; } = new();
}
