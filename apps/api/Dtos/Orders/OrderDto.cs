namespace Api.Dtos.Orders;

public class OrderDto
{
    public string Id { get; set; } = "";

    public string Status { get; set; } = "";
    public string Currency { get; set; } = "CAD";

    public string PaymentStatus { get; set; } = "";
    public string PayMethod { get; set; } = "";

    public int SubtotalCents { get; set; }
    public int TaxCents { get; set; }
    public int TotalCents { get; set; }

    public DateTime CreatedAt { get; set; }  
    public DateTime PickupAt { get; set; }

    public CustomerInfoDto Customer { get; set; } = new();

    public List<OrderLineItemDto> LineItems { get; set; } = new();
}