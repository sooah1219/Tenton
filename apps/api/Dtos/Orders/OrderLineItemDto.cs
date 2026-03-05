namespace Api.Dtos.Orders;

public class OrderLineItemDto
{
    public string Id { get; set; } = "";
    public string OrderId { get; set; } = "";

    public string MenuItemId { get; set; } = "";

    public string ItemNameSnapshot { get; set; } = "";
    public string? ItemImageUrlSnapshot { get; set; }

    public int UnitBasePriceCentsSnapshot { get; set; }
    public string Currency { get; set; } = "CAD";

    public int Qty { get; set; }
    public string? Note { get; set; }

    public int LineSubtotalCentsSnapshot { get; set; }

    public List<OrderLineOptionDto> Options { get; set; } = new();
}