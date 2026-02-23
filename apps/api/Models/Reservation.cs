using System.ComponentModel.DataAnnotations;

public class Reservation
{
    public Guid Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = "";

    [MaxLength(50)]
    public string Phone { get; set; } = "";

    public int PartySize { get; set; }

    public DateTimeOffset ReservedAt { get; set; }

    public string? Note { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "confirmed";

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
