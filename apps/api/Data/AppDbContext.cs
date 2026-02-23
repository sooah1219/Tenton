using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Reservation>().ToTable("reservations");
        b.Entity<MenuItem>().ToTable("menu_items");
        b.Entity<Order>().ToTable("orders");
        b.Entity<OrderItem>().ToTable("order_items");

        b.Entity<Reservation>().Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        b.Entity<MenuItem>().Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        b.Entity<Order>().Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        b.Entity<OrderItem>().Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");


        b.Entity<Order>()
            .HasMany(o => o.Items)
            .WithOne(i => i.Order!)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Order>()
            .Property(o => o.OrderNo)
            .HasDefaultValueSql("nextval('orders_order_no_seq')")
            .ValueGeneratedOnAdd();

        b.Entity<Reservation>().Property(x => x.PartySize).HasColumnName("party_size");
        b.Entity<Reservation>().Property(x => x.ReservedAt).HasColumnName("reserved_at");
        b.Entity<Reservation>().Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Entity<Reservation>().Property(x => x.UpdatedAt).HasColumnName("updated_at");

        b.Entity<MenuItem>().Property(x => x.PriceCents).HasColumnName("price_cents");
        b.Entity<MenuItem>().Property(x => x.IsAvailable).HasColumnName("is_available");
        b.Entity<MenuItem>().Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Entity<MenuItem>().Property(x => x.UpdatedAt).HasColumnName("updated_at");

        b.Entity<Order>().Property(x => x.OrderNo).HasColumnName("order_no");
        b.Entity<Order>().Property(x => x.CustomerName).HasColumnName("customer_name");
        b.Entity<Order>().Property(x => x.CustomerPhone).HasColumnName("customer_phone");
        b.Entity<Order>().Property(x => x.OrderType).HasColumnName("order_type");
        b.Entity<Order>().Property(x => x.Status).HasColumnName("status");
        b.Entity<Order>().Property(x => x.Note).HasColumnName("note");
        b.Entity<Order>().Property(x => x.SubtotalCents).HasColumnName("subtotal_cents");
        b.Entity<Order>().Property(x => x.TaxCents).HasColumnName("tax_cents");
        b.Entity<Order>().Property(x => x.TotalCents).HasColumnName("total_cents");
        b.Entity<Order>().Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Entity<Order>().Property(x => x.UpdatedAt).HasColumnName("updated_at");


        b.Entity<OrderItem>().Property(x => x.OrderId).HasColumnName("order_id");
        b.Entity<OrderItem>().Property(x => x.MenuItemId).HasColumnName("menu_item_id");
        b.Entity<OrderItem>().Property(x => x.ItemName).HasColumnName("item_name");
        b.Entity<OrderItem>().Property(x => x.Quantity).HasColumnName("quantity");
        b.Entity<OrderItem>().Property(x => x.UnitPriceCents).HasColumnName("unit_price_cents");
        b.Entity<OrderItem>().Property(x => x.LineTotalCents).HasColumnName("line_total_cents");
        b.Entity<OrderItem>().Property(x => x.CreatedAt).HasColumnName("created_at");
    }
}
