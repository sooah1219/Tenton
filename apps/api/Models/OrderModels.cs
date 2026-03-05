namespace Api.Models;

public class CustomerInfo
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Note { get; set; }
}

public class Order : GuidEntity
{
    public OrderStatus Status { get; set; } = OrderStatus.CONFIRMED;
    public PayMethod PayMethod { get; set; } = PayMethod.store;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.UNPAID;
    public DateTime PickupAt { get; set; }
    public CustomerInfo Customer { get; set; } = new();
    public Currency Currency { get; set; } = Currency.CAD;
    public int SubtotalCents { get; set; }
    public int TaxCents { get; set; }
    public int TotalCents { get; set; }

    public List<OrderLineItem> LineItems { get; set; } = new();
}

public class OrderLineItem : GuidEntity
{
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }

    public string MenuItemId { get; set; } = default!;

    public string ItemNameSnapshot { get; set; } = "";
    public string? ItemImageUrlSnapshot { get; set; }

    public int UnitBasePriceCentsSnapshot { get; set; }
    public Currency Currency { get; set; } = Currency.CAD;

    public int Qty { get; set; }
    public string? Note { get; set; }

    public int LineSubtotalCentsSnapshot { get; set; }

    public List<OrderLineOption> Options { get; set; } = new();
}

public class OrderLineOption : GuidEntity
{
    public Guid OrderLineItemId { get; set; }
    public OrderLineItem? OrderLineItem { get; set; }

    public string GroupId { get; set; } = default!;
    public string GroupTitleSnapshot { get; set; } = "";

    public string OptionId { get; set; } = default!;
    public string OptionNameSnapshot { get; set; } = "";

    public int UnitPriceDeltaCentsSnapshot { get; set; }
    public int Qty { get; set; }
}