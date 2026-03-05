namespace Api.Dtos.Orders;

public class OrderLineOptionDto
{
    public string Id { get; set; } = "";
    public string OrderLineItemId { get; set; } = "";

    public string GroupId { get; set; } = "";
    public string GroupTitleSnapshot { get; set; } = "";

    public string OptionId { get; set; } = "";
    public string OptionNameSnapshot { get; set; } = "";

    public int UnitPriceDeltaCentsSnapshot { get; set; }

    public int Qty { get; set; }
}