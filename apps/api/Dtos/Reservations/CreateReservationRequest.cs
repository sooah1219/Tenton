namespace Api.Dtos.Reservations;
// belongs to the
using System.ComponentModel.DataAnnotations;
// validation

public class CreateReservationRequest
{
[Required, RegularExpression(@"^\d{4}-\d{2}-\d{2}$")]
    public string DateIso { get; set; } = default!;

    [Required]
    public string Time { get; set; } = default!;

    [Required]
    public int PartySize { get; set; } = default!;

    [Required, MaxLength(50)]
    public string FirstName { get; set; } = default!;

    [Required, MaxLength(50)]
    public string LastName { get; set; } = default!;

    [Required, MaxLength(30)]
    public string Phone { get; set; } = default!;

    [Required, EmailAddress, MaxLength(120)]
    public string Email { get; set; } = default!;

    [MaxLength(500)]
    public string? Note { get; set; }
}