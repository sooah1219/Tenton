using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderPickupAndPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PickupAt",
                table: "orders",
                newName: "pickup_at");

            migrationBuilder.RenameColumn(
                name: "PaymentStatus",
                table: "orders",
                newName: "payment_status");

            migrationBuilder.RenameColumn(
                name: "PayMethod",
                table: "orders",
                newName: "pay_method");

            migrationBuilder.AlterColumn<DateTime>(
                name: "pickup_at",
                table: "orders",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "pickup_at",
                table: "orders",
                newName: "PickupAt");

            migrationBuilder.RenameColumn(
                name: "payment_status",
                table: "orders",
                newName: "PaymentStatus");

            migrationBuilder.RenameColumn(
                name: "pay_method",
                table: "orders",
                newName: "PayMethod");

            migrationBuilder.AlterColumn<DateTime>(
                name: "PickupAt",
                table: "orders",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");
        }
    }
}
