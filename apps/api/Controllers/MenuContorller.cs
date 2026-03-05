namespace Api.Controllers;
using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/menu")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _db;
    public MenuController(AppDbContext db) => _db = db;

    // GET /api/menu/categories
    [HttpGet("categories")]
    public async Task<ActionResult<List<Category>>> GetCategories()
    {
        var list = await _db.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        return Ok(list);
    }

    // GET /api/menu/items?categoryId=ramen&q=...&includeInactive=true
    [HttpGet("items")]
    public async Task<ActionResult<List<MenuItem>>> GetItems(
        [FromQuery] string? categoryId = null,
        [FromQuery] string? q = null,
        [FromQuery] bool includeInactive = false
    )
    {
        var query = _db.MenuItems.AsQueryable();

        if (!includeInactive) query = query.Where(m => m.IsActive);

        if (!string.IsNullOrWhiteSpace(categoryId))
            query = query.Where(m => m.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            query = query.Where(m => m.Name.ToLower().Contains(term));
        }

        var list = await query
            .OrderBy(m => m.SortOrder)
            .ToListAsync();

        return Ok(list);
    }
}