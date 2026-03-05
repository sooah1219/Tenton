namespace Api.Controllers;

using Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Authorize(Policy = "AdminOnly")]
[ApiController]
[Route("api/admin/reservations")]
public class AdminReservationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminReservationsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/admin/reservations?date=YYYY-MM-DD
    [HttpGet]
    public async Task<ActionResult<object>> List([FromQuery] string? date)
    {
        var q = _db.Reservations.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(date))
        {
            var parts = date.Trim().Split('-', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 3)
                return BadRequest(new { message = "Invalid date format. Use YYYY-MM-DD." });

            if (!int.TryParse(parts[0], out var y) ||
                !int.TryParse(parts[1], out var m) ||
                !int.TryParse(parts[2], out var d))
                return BadRequest(new { message = "Invalid date numbers. Use YYYY-MM-DD." });

            var start = new DateTime(y, m, d, 0, 0, 0);
            var end = start.AddDays(1);

            q = q.Where(r => r.ReservedAt >= start && r.ReservedAt < end);
        }

        var items = await q
            .OrderBy(r => r.ReservedAt)
            .Select(r => new
            {
                id = r.Id,
                reservedAt = r.ReservedAt,
                partySize = r.PartySize,
                firstName = r.FirstName,
                lastName = r.LastName,
                phone = r.Phone,
                email = r.Email,
                note = r.Note,
                createdAt = r.CreatedAt,
                updatedAt = r.UpdatedAt
            })
            .Take(500)
            .ToListAsync();

        return Ok(items);
    }

    // GET /api/admin/reservations/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> GetOne(Guid id)
    {
        var r = await _db.Reservations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (r == null) return NotFound();
        return Ok(r);
    }

    // DELETE /api/admin/reservations/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var r = await _db.Reservations.FirstOrDefaultAsync(x => x.Id == id);
        if (r == null) return NotFound();

        _db.Reservations.Remove(r);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}