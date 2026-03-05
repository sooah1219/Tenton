namespace Api.Controllers;
// Controller : API endpoint(POST / GET), Class to process the HTTP request 
using Api.Data;
// to use AppDbContext.cs file (DbContext is the database connection class - used to access the database )
using Api.Dtos.Reservations;
// allows the controller to use CreateReservationRequest.cs file
using Api.Models;
// allows the controller to use the Reservation model
using Api.Utils;
// import utils helpers
using Microsoft.AspNetCore.Mvc;
// Provides ASP.NET Core API features ( [HttpGet] , ..)
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/[controller]")]
// basic URL path (api/reservations)

public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReservationsController(AppDbContext db)
    {
        _db = db;
    }
    private static bool IsBlank(string? s)
        => string.IsNullOrWhiteSpace(s);

    private static DateTime BuildReservedAt(string dateIso, string time12h)
    {
        // "2026-03-10" + "6:30 PM"
        var mins = TimeParsing.ToMinutes(time12h);

        var parts = dateIso.Split('-', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 3) throw new Exception("Invalid date");

        var y = int.Parse(parts[0]);
        var m = int.Parse(parts[1]);
        var d = int.Parse(parts[2]);

        var hh = mins / 60;
        var mm = mins % 60;

        return new DateTime(y, m, d, hh, mm, 0); // Vancouver local
    }

    // ----------------------------
    // POST /api/reservations
    // ----------------------------
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest req)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        DateTime reservedAt;

        try
        {
            reservedAt = BuildReservedAt(req.DateIso.Trim(), req.Time.Trim());
        }
        catch
        {
            return BadRequest(new { message = "Invalid date/time." });
        }

        var partySize = req.PartySize;

        var now = DateTime.UtcNow;

        var entity = new Reservation
        {
            ReservedAt = reservedAt, // Vancouver local
            PartySize = partySize,
            FirstName = req.FirstName.Trim(),
            LastName = req.LastName.Trim(),
            Phone = req.Phone.Trim(),
            Email = req.Email.Trim(),
            Note = IsBlank(req.Note) ? null : req.Note!.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Reservations.Add(entity);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    // ----------------------------
    // GET /api/reservations/{id}
    // ----------------------------
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var r = await _db.Reservations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (r == null)
            return NotFound();

        return Ok(r);
    }

    // ----------------------------
    // GET /api/reservations?date=YYYY-MM-DD
    // ----------------------------
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? date)
    {
        var q = _db.Reservations.AsNoTracking();

        if (!IsBlank(date))
        {
            var parts = date!.Trim().Split('-', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length != 3)
                return BadRequest(new { message = "Invalid date format. Use YYYY-MM-DD." });

            int y = int.Parse(parts[0]);
            int m = int.Parse(parts[1]);
            int d = int.Parse(parts[2]);

            var start = new DateTime(y, m, d, 0, 0, 0);
            var end = start.AddDays(1);

            q = q.Where(r => r.ReservedAt >= start && r.ReservedAt < end);
        }

        var items = await q
            .OrderBy(r => r.ReservedAt)
            .ThenBy(r => r.CreatedAt)
            .Take(500)
            .ToListAsync();

        return Ok(items);
    }
}