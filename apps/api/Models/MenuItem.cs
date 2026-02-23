using System.ComponentModel.DataAnnotations;

public class MenuItem
{
    public Guid Id { get; set; }

    [MaxLength(100)]
    public string? Sku { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = "";

    public string? Description { get; set; }

    public int PriceCents { get; set; }

    public bool IsAvailable { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
