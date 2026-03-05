using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Api.Controllers;

[ApiController]
[Route("api/admin/auth")]
public class AdminAuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public AdminAuthController(IConfiguration config, IWebHostEnvironment env)
    {
        _config = config;
        _env = env;
    }

    public record LoginReq(string Password);

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginReq req)
    {
        var adminPw = _config["ADMIN_PASSWORD"] ?? "";
        if (string.IsNullOrWhiteSpace(adminPw) || req.Password != adminPw)
            return Unauthorized("Invalid admin password");

        var secret = _config["ADMIN_JWT_SECRET"] ?? "";
        if (secret.Length < 32)
            return StatusCode(500, "ADMIN_JWT_SECRET too short");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Role, "Admin")
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: creds
        );

        var tokenStr = new JwtSecurityTokenHandler().WriteToken(token);

        Response.Cookies.Append("admin_token", tokenStr, new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(12),
            Path = "/"
        });

        return Ok(new { ok = true });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("admin_token", new CookieOptions
        {
            Path = "/"
        });

        return Ok(new { ok = true });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var role = User.FindFirstValue("role") ?? "";
        return Ok(new { role });
    }

    [Authorize]
    [HttpGet("debug")]
    public IActionResult DebugClaims()
    {
        var claims = User.Claims.Select(c => new
        {
            type = c.Type,
            value = c.Value
        });

        return Ok(claims);
    }
}