using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "categories",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    icon = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "option_groups",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    kind = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    step = table.Column<int>(type: "integer", nullable: false),
                    selection = table.Column<int>(type: "integer", nullable: false),
                    required = table.Column<bool>(type: "boolean", nullable: false),
                    min_selected = table.Column<int>(type: "integer", nullable: false),
                    max_selected = table.Column<int>(type: "integer", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_option_groups", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    status = table.Column<int>(type: "integer", nullable: false),
                    customer_first_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    customer_last_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    customer_phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    customer_email = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    customer_note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    currency = table.Column<int>(type: "integer", nullable: false),
                    subtotal_cents = table.Column<int>(type: "integer", nullable: false),
                    tax_cents = table.Column<int>(type: "integer", nullable: false),
                    total_cents = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orders", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "reservations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    reserved_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    party_size = table.Column<int>(type: "integer", nullable: false),
                    first_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    last_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reservations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "menu_items",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    category_id = table.Column<string>(type: "text", nullable: false),
                    kind = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    description = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: true),
                    price_cents = table.Column<int>(type: "integer", nullable: false),
                    currency = table.Column<int>(type: "integer", nullable: false),
                    image_url = table.Column<string>(type: "character varying(600)", maxLength: 600, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_menu_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_menu_items_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "options",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    group_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    description = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: true),
                    price_delta_cents = table.Column<int>(type: "integer", nullable: false),
                    currency = table.Column<int>(type: "integer", nullable: false),
                    image_url = table.Column<string>(type: "character varying(600)", maxLength: 600, nullable: true),
                    max_qty = table.Column<int>(type: "integer", nullable: true),
                    default_qty = table.Column<int>(type: "integer", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_options", x => x.id);
                    table.ForeignKey(
                        name: "FK_options_option_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "option_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "order_line_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    menu_item_id = table.Column<string>(type: "text", nullable: false),
                    item_name_snapshot = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    item_image_url_snapshot = table.Column<string>(type: "character varying(600)", maxLength: 600, nullable: true),
                    unit_base_price_cents_snapshot = table.Column<int>(type: "integer", nullable: false),
                    currency = table.Column<int>(type: "integer", nullable: false),
                    qty = table.Column<int>(type: "integer", nullable: false),
                    note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    line_subtotal_cents_snapshot = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_line_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_order_line_items_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "menu_item_option_groups",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    menu_item_id = table.Column<string>(type: "text", nullable: false),
                    group_id = table.Column<string>(type: "text", nullable: false),
                    required_override = table.Column<bool>(type: "boolean", nullable: true),
                    min_selected_override = table.Column<int>(type: "integer", nullable: true),
                    max_selected_override = table.Column<int>(type: "integer", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_menu_item_option_groups", x => x.id);
                    table.ForeignKey(
                        name: "FK_menu_item_option_groups_menu_items_menu_item_id",
                        column: x => x.menu_item_id,
                        principalTable: "menu_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_menu_item_option_groups_option_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "option_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "menu_item_allowed_options",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    menu_item_id = table.Column<string>(type: "text", nullable: false),
                    option_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_menu_item_allowed_options", x => x.id);
                    table.ForeignKey(
                        name: "FK_menu_item_allowed_options_menu_items_menu_item_id",
                        column: x => x.menu_item_id,
                        principalTable: "menu_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_menu_item_allowed_options_options_option_id",
                        column: x => x.option_id,
                        principalTable: "options",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "order_line_options",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    order_line_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    group_id = table.Column<string>(type: "text", nullable: false),
                    group_title_snapshot = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    option_id = table.Column<string>(type: "text", nullable: false),
                    option_name_snapshot = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    unit_price_delta_cents_snapshot = table.Column<int>(type: "integer", nullable: false),
                    qty = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_line_options", x => x.id);
                    table.ForeignKey(
                        name: "FK_order_line_options_order_line_items_order_line_item_id",
                        column: x => x.order_line_item_id,
                        principalTable: "order_line_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_categories_is_active",
                table: "categories",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_categories_sort_order",
                table: "categories",
                column: "sort_order");

            migrationBuilder.CreateIndex(
                name: "ix_menu_item_allowed_options_menu_item_id",
                table: "menu_item_allowed_options",
                column: "menu_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_menu_item_allowed_options_option_id",
                table: "menu_item_allowed_options",
                column: "option_id");

            migrationBuilder.CreateIndex(
                name: "ux_menu_item_allowed_options_menuitem_option",
                table: "menu_item_allowed_options",
                columns: new[] { "menu_item_id", "option_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_menu_item_option_groups_group_id",
                table: "menu_item_option_groups",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "ix_menu_item_option_groups_menu_item_id",
                table: "menu_item_option_groups",
                column: "menu_item_id");

            migrationBuilder.CreateIndex(
                name: "ux_menu_item_option_groups_menuitem_group",
                table: "menu_item_option_groups",
                columns: new[] { "menu_item_id", "group_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_menu_items_category_id",
                table: "menu_items",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_menu_items_is_active",
                table: "menu_items",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_menu_items_sort_order",
                table: "menu_items",
                column: "sort_order");

            migrationBuilder.CreateIndex(
                name: "ix_option_groups_is_active",
                table: "option_groups",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_option_groups_kind",
                table: "option_groups",
                column: "kind");

            migrationBuilder.CreateIndex(
                name: "ix_option_groups_sort_order",
                table: "option_groups",
                column: "sort_order");

            migrationBuilder.CreateIndex(
                name: "ix_options_group_id",
                table: "options",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "ix_options_is_active",
                table: "options",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_options_sort_order",
                table: "options",
                column: "sort_order");

            migrationBuilder.CreateIndex(
                name: "ix_order_line_items_menu_item_id",
                table: "order_line_items",
                column: "menu_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_line_items_order_id",
                table: "order_line_items",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_line_options_group_id",
                table: "order_line_options",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_line_options_option_id",
                table: "order_line_options",
                column: "option_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_line_options_order_line_item_id",
                table: "order_line_options",
                column: "order_line_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_orders_created_at",
                table: "orders",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_orders_status",
                table: "orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_reservations_reserved_at",
                table: "reservations",
                column: "reserved_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "menu_item_allowed_options");

            migrationBuilder.DropTable(
                name: "menu_item_option_groups");

            migrationBuilder.DropTable(
                name: "order_line_options");

            migrationBuilder.DropTable(
                name: "reservations");

            migrationBuilder.DropTable(
                name: "options");

            migrationBuilder.DropTable(
                name: "menu_items");

            migrationBuilder.DropTable(
                name: "order_line_items");

            migrationBuilder.DropTable(
                name: "option_groups");

            migrationBuilder.DropTable(
                name: "categories");

            migrationBuilder.DropTable(
                name: "orders");
        }
    }
}
