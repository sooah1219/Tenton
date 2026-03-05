namespace Api.Models;
// namespace organize code into groups (This Class belongs to the Models Section of the API)
using System.ComponentModel.DataAnnotations;
// Validation attributes - to use library like required or maxLength

public class Reservation
{
    public Guid Id { get; set; }
    // reservation Primary Key
    public DateTime ReservedAt { get; set; }
    // save reservation date and time (2026-03-04 18:30)
    public int PartySize { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName  { get; set; } = "";
    public string Phone     { get; set; } = "";
    public string Email     { get; set; } = "";
    public string? Note     { get; set; }

    // System timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}