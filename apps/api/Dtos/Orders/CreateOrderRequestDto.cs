namespace Api.Dtos.Orders;

public class CreateOrderRequestDto
{
    public CustomerInfoDto Customer { get; set; } = new();
    public DateTime PickupAt { get; set; } 
    public string? PayMethod { get; set; }
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    public string MenuItemId { get; set; } = "";
    public int Qty { get; set; }
    public string? Note { get; set; }
    public RamenSelectionDto? Ramen { get; set; }
}

public class RamenSelectionDto
{
    public string ProteinOptionId { get; set; } = "";
    public string NoodleOptionId { get; set; } = "";
    public List<ToppingPickDto> Toppings { get; set; } = new();
    public string? Note { get; set; }
}

public class ToppingPickDto
{
    public string OptionId { get; set; } = "";
    public int Qty { get; set; }
}