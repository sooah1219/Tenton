namespace Api.Data;

// this file is for connect between C# code(reservation class) and Neon DB table
using Api.Models;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Reservation> Reservations => Set<Reservation>();

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<OptionGroup> OptionGroups => Set<OptionGroup>();
    public DbSet<Option> Options => Set<Option>();
    public DbSet<MenuItemOptionGroup> MenuItemOptionGroups => Set<MenuItemOptionGroup>();
    public DbSet<MenuItemAllowedOption> MenuItemAllowedOptions => Set<MenuItemAllowedOption>();

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLineItem> OrderLineItems => Set<OrderLineItem>();
    public DbSet<OrderLineOption> OrderLineOptions => Set<OrderLineOption>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<Category>().Property(x => x.Id).ValueGeneratedNever();
        b.Entity<MenuItem>().Property(x => x.Id).ValueGeneratedNever();
        b.Entity<OptionGroup>().Property(x => x.Id).ValueGeneratedNever();
        b.Entity<Option>().Property(x => x.Id).ValueGeneratedNever();

        var r = b.Entity<Reservation>();

        r.ToTable("reservations");

        r.Property(x => x.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();

        // Vancouver local time (no timezone)
        r.Property(x => x.ReservedAt)
            .HasColumnName("reserved_at")
            .HasColumnType("timestamp without time zone");

        r.Property(x => x.PartySize).HasColumnName("party_size");

        r.Property(x => x.FirstName).HasColumnName("first_name").HasMaxLength(50).IsRequired();
        r.Property(x => x.LastName).HasColumnName("last_name").HasMaxLength(50).IsRequired();
        r.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(30).IsRequired();
        r.Property(x => x.Email).HasColumnName("email").HasMaxLength(120).IsRequired();
        r.Property(x => x.Note).HasColumnName("note").HasMaxLength(500);

        // System timestamps (UTC) -> timestamp
        r.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        r.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        r.HasIndex(x => x.ReservedAt)
            .HasDatabaseName("ix_reservations_reserved_at");

        // =========================================================
        // categories
        // =========================================================
        b.Entity<Category>(e =>
        {
            e.ToTable("categories");

            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(80).IsRequired();
            e.Property(x => x.Icon).HasColumnName("icon").HasMaxLength(400);

            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsActive).HasColumnName("is_active");

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => x.SortOrder).HasDatabaseName("ix_categories_sort_order");
            e.HasIndex(x => x.IsActive).HasDatabaseName("ix_categories_is_active");
        });

        // =========================================================
        // menu_items
        // =========================================================
        b.Entity<MenuItem>(e =>
        {
            e.ToTable("menu_items");

            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.CategoryId).HasColumnName("category_id");

            e.HasOne(x => x.Category)
                .WithMany(c => c.MenuItems)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(x => x.Kind).HasColumnName("kind"); // enum -> int
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(120).IsRequired();
            e.Property(x => x.Description).HasColumnName("description").HasMaxLength(1200);

            e.Property(x => x.PriceCents).HasColumnName("price_cents");
            e.Property(x => x.Currency).HasColumnName("currency"); // enum -> int
            e.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(600);

            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsActive).HasColumnName("is_active");

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => x.CategoryId).HasDatabaseName("ix_menu_items_category_id");
            e.HasIndex(x => x.IsActive).HasDatabaseName("ix_menu_items_is_active");
            e.HasIndex(x => x.SortOrder).HasDatabaseName("ix_menu_items_sort_order");
        });

        // =========================================================
        // option_groups
        // =========================================================
        b.Entity<OptionGroup>(e =>
        {
            e.ToTable("option_groups");

            e.Property(x => x.Id).HasColumnName("id");

            e.Property(x => x.Kind).HasColumnName("kind"); // enum -> int
            e.Property(x => x.Title).HasColumnName("title").HasMaxLength(120).IsRequired();
            e.Property(x => x.Step).HasColumnName("step");

            e.Property(x => x.Selection).HasColumnName("selection"); // enum -> int
            e.Property(x => x.Required).HasColumnName("required");

            e.Property(x => x.MinSelected).HasColumnName("min_selected");
            e.Property(x => x.MaxSelected).HasColumnName("max_selected");

            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsActive).HasColumnName("is_active");

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => x.Kind).HasDatabaseName("ix_option_groups_kind");
            e.HasIndex(x => x.IsActive).HasDatabaseName("ix_option_groups_is_active");
            e.HasIndex(x => x.SortOrder).HasDatabaseName("ix_option_groups_sort_order");
        });

        // =========================================================
        // options
        // =========================================================
        b.Entity<Option>(e =>
        {
            e.ToTable("options");

            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.GroupId).HasColumnName("group_id");

            e.HasOne(x => x.Group)
                .WithMany(g => g.Options)
                .HasForeignKey(x => x.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(120).IsRequired();
            e.Property(x => x.Description).HasColumnName("description").HasMaxLength(1200);

            e.Property(x => x.PriceDeltaCents).HasColumnName("price_delta_cents");
            e.Property(x => x.Currency).HasColumnName("currency");
            e.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(600);

            e.Property(x => x.MaxQty).HasColumnName("max_qty");
            e.Property(x => x.DefaultQty).HasColumnName("default_qty");

            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsActive).HasColumnName("is_active");

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => x.GroupId).HasDatabaseName("ix_options_group_id");
            e.HasIndex(x => x.IsActive).HasDatabaseName("ix_options_is_active");
            e.HasIndex(x => x.SortOrder).HasDatabaseName("ix_options_sort_order");
        });

        // =========================================================
        // menu_item_option_groups (join)
        // - Id: Guid (default uuid)
        // - MenuItemId/GroupId: string
        // =========================================================
        b.Entity<MenuItemOptionGroup>(e =>
        {
            e.ToTable("menu_item_option_groups");

            e.HasKey(x => x.Id);

            e.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()")
                .ValueGeneratedOnAdd();

            e.Property(x => x.MenuItemId).HasColumnName("menu_item_id");
            e.Property(x => x.GroupId).HasColumnName("group_id");

            e.HasOne(x => x.MenuItem)
                .WithMany(m => m.OptionGroups)
                .HasForeignKey(x => x.MenuItemId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Group)
                .WithMany()
                .HasForeignKey(x => x.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(x => x.RequiredOverride).HasColumnName("required_override");
            e.Property(x => x.MinSelectedOverride).HasColumnName("min_selected_override");
            e.Property(x => x.MaxSelectedOverride).HasColumnName("max_selected_override");

            e.Property(x => x.SortOrder).HasColumnName("sort_order");

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => new { x.MenuItemId, x.GroupId })
                .IsUnique()
                .HasDatabaseName("ux_menu_item_option_groups_menuitem_group");

            e.HasIndex(x => x.MenuItemId).HasDatabaseName("ix_menu_item_option_groups_menu_item_id");
            e.HasIndex(x => x.GroupId).HasDatabaseName("ix_menu_item_option_groups_group_id");
        });

        // =========================================================
        // menu_item_allowed_options (join)
        // - Id: Guid (default uuid)
        // - MenuItemId/OptionId: string
        // =========================================================
        b.Entity<MenuItemAllowedOption>(e =>
        {
            e.ToTable("menu_item_allowed_options");

            e.HasKey(x => x.Id);

            e.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()")
                .ValueGeneratedOnAdd();

            e.Property(x => x.MenuItemId).HasColumnName("menu_item_id");
            e.Property(x => x.OptionId).HasColumnName("option_id");

            e.HasOne(x => x.MenuItem)
                .WithMany()
                .HasForeignKey(x => x.MenuItemId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Option)
                .WithMany()
                .HasForeignKey(x => x.OptionId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => new { x.MenuItemId, x.OptionId })
                .IsUnique()
                .HasDatabaseName("ux_menu_item_allowed_options_menuitem_option");

            e.HasIndex(x => x.MenuItemId).HasDatabaseName("ix_menu_item_allowed_options_menu_item_id");
            e.HasIndex(x => x.OptionId).HasDatabaseName("ix_menu_item_allowed_options_option_id");
        });

        // =========================================================
        // orders
        // - Id: Guid uuid
        // - Customer: owned columns fixed names
        // =========================================================
        b.Entity<Order>(e =>
        {
            e.ToTable("orders");

            e.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()")
                .ValueGeneratedOnAdd();

            e.Property(x => x.Status).HasColumnName("status");   // enum -> int
            e.Property(x => x.Currency).HasColumnName("currency"); // enum -> int

            e.Property(x => x.SubtotalCents).HasColumnName("subtotal_cents");
            e.Property(x => x.TaxCents).HasColumnName("tax_cents");
            e.Property(x => x.TotalCents).HasColumnName("total_cents");

            e.Property(x => x.PickupAt).HasColumnType("timestamptz");

            e.Property(x => x.PayMethod).HasColumnName("pay_method");           // enum -> int
            e.Property(x => x.PaymentStatus).HasColumnName("payment_status");   // enum -> int

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => x.CreatedAt).HasDatabaseName("ix_orders_created_at");
            e.HasIndex(x => x.Status).HasDatabaseName("ix_orders_status");

            e.OwnsOne(x => x.Customer, owned =>
            {
                owned.Property(p => p.FirstName).HasColumnName("customer_first_name").HasMaxLength(50).IsRequired();
                owned.Property(p => p.LastName).HasColumnName("customer_last_name").HasMaxLength(50).IsRequired();
                owned.Property(p => p.Phone).HasColumnName("customer_phone").HasMaxLength(30).IsRequired();
                owned.Property(p => p.Email).HasColumnName("customer_email").HasMaxLength(120).IsRequired();
                owned.Property(p => p.Note).HasColumnName("customer_note").HasMaxLength(500);
            });
        });

        // =========================================================
        // order_line_items
        // - Id: Guid uuid
        // - OrderId: Guid FK
        // - MenuItemId: string (프론트 ID)
        // =========================================================
        b.Entity<OrderLineItem>(e =>
        {
            e.ToTable("order_line_items");

            e.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()")
                .ValueGeneratedOnAdd();

            e.Property(x => x.OrderId).HasColumnName("order_id");

            e.HasOne(x => x.Order)
                .WithMany(o => o.LineItems)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(x => x.MenuItemId).HasColumnName("menu_item_id");

            e.Property(x => x.ItemNameSnapshot).HasColumnName("item_name_snapshot").HasMaxLength(200).IsRequired();
            e.Property(x => x.ItemImageUrlSnapshot).HasColumnName("item_image_url_snapshot").HasMaxLength(600);

            e.Property(x => x.UnitBasePriceCentsSnapshot).HasColumnName("unit_base_price_cents_snapshot");
            e.Property(x => x.Currency).HasColumnName("currency");

            e.Property(x => x.Qty).HasColumnName("qty");
            e.Property(x => x.Note).HasColumnName("note").HasMaxLength(500);

            e.Property(x => x.LineSubtotalCentsSnapshot).HasColumnName("line_subtotal_cents_snapshot");

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => x.OrderId).HasDatabaseName("ix_order_line_items_order_id");
            e.HasIndex(x => x.MenuItemId).HasDatabaseName("ix_order_line_items_menu_item_id");
        });

        // =========================================================
        // order_line_options
        // - Id: Guid uuid
        // - OrderLineItemId: Guid FK
        // - GroupId/OptionId: string
        // =========================================================
        b.Entity<OrderLineOption>(e =>
        {
            e.ToTable("order_line_options");

            e.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()")
                .ValueGeneratedOnAdd();

            e.Property(x => x.OrderLineItemId).HasColumnName("order_line_item_id");

            e.HasOne(x => x.OrderLineItem)
                .WithMany(li => li.Options)
                .HasForeignKey(x => x.OrderLineItemId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(x => x.GroupId).HasColumnName("group_id");
            e.Property(x => x.GroupTitleSnapshot).HasColumnName("group_title_snapshot").HasMaxLength(120).IsRequired();

            e.Property(x => x.OptionId).HasColumnName("option_id");
            e.Property(x => x.OptionNameSnapshot).HasColumnName("option_name_snapshot").HasMaxLength(120).IsRequired();

            e.Property(x => x.UnitPriceDeltaCentsSnapshot).HasColumnName("unit_price_delta_cents_snapshot");
            e.Property(x => x.Qty).HasColumnName("qty");

            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

            e.HasIndex(x => x.OrderLineItemId).HasDatabaseName("ix_order_line_options_order_line_item_id");
            e.HasIndex(x => x.OptionId).HasDatabaseName("ix_order_line_options_option_id");
            e.HasIndex(x => x.GroupId).HasDatabaseName("ix_order_line_options_group_id");
        });
    }

    public override int SaveChanges()
    {
        TouchTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        TouchTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void TouchTimestamps()
    {
        var now = DateTime.UtcNow;
        foreach (var e in ChangeTracker.Entries<BaseEntity>())
        {
            if (e.State == EntityState.Added)
            {
                e.Entity.CreatedAt = now;
                e.Entity.UpdatedAt = now;
            }
            else if (e.State == EntityState.Modified)
            {
                e.Entity.UpdatedAt = now;
            }
        }
    }
}