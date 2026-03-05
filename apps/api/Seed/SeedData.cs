using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public static class SeedData
{
    public static async Task EnsureSeededAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        var now = DateTime.UtcNow;

        // =========================================================
        // 1) Categories
        // =========================================================
        if (!await db.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Id="ramen", Name="Ramen", Icon="/icons/ramen.svg", SortOrder=1, IsActive=true, CreatedAt=now, UpdatedAt=now },
                new() { Id="katsu", Name="Katsu", Icon="/icons/tonkatsu.svg", SortOrder=2, IsActive=true, CreatedAt=now, UpdatedAt=now },
                new() { Id="udon", Name="Udon", Icon="/icons/udon.svg", SortOrder=3, IsActive=true, CreatedAt=now, UpdatedAt=now },
                new() { Id="rice", Name="Rice", Icon="/icons/rice.svg", SortOrder=4, IsActive=true, CreatedAt=now, UpdatedAt=now },
                new() { Id="appetizer", Name="Appetizer", Icon="/icons/gyoza.svg", SortOrder=5, IsActive=true, CreatedAt=now, UpdatedAt=now },
                new() { Id="salad", Name="Salad", Icon="/icons/salad.svg", SortOrder=6, IsActive=true, CreatedAt=now, UpdatedAt=now },
                new() { Id="dessert", Name="Dessert", Icon="/icons/dessert.svg", SortOrder=7, IsActive=true, CreatedAt=now, UpdatedAt=now },
                new() { Id="combo", Name="Combo", Icon="", SortOrder=8, IsActive=true, CreatedAt=now, UpdatedAt=now },
            };

            await db.Categories.AddRangeAsync(categories);
            await db.SaveChangesAsync();
        }

        // =========================================================
        // 2) MenuItems
        // =========================================================
        if (!await db.MenuItems.AnyAsync())
        {
            var items = new List<MenuItem>
            {
               
                new() { Id="r1", CategoryId="ramen", Kind=MenuItemKind.ramen, Name="Original Ramen",
                    Description="Classic tonkotsu-style pork broth with rich umami and a clean finish.",
                    PriceCents=1750, Currency=Currency.CAD, ImageUrl="/ramen/original.png", SortOrder=1, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="r2", CategoryId="ramen", Kind=MenuItemKind.ramen, Name="Miso Ramen",
                    Description="Savory pork broth blended with miso for a deeper, slightly sweet and nutty flavor.",
                    PriceCents=1850, Currency=Currency.CAD, ImageUrl="/ramen/miso.png", SortOrder=2, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="r3", CategoryId="ramen", Kind=MenuItemKind.ramen, Name="Spicy Miso Ramen",
                    Description="Miso pork broth with a spicy kick—warm heat and bold, satisfying flavor.",
                    PriceCents=1950, Currency=Currency.CAD, ImageUrl="/ramen/spicymiso.png", SortOrder=3, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="r4", CategoryId="ramen", Kind=MenuItemKind.ramen, Name="Black Ramen",
                    Description="Pork broth topped with aromatic black garlic oil for a smoky, roasted depth.",
                    PriceCents=1950, Currency=Currency.CAD, ImageUrl="/ramen/black.png", SortOrder=4, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="r5", CategoryId="ramen", Kind=MenuItemKind.ramen, Name="Vegetable Ramen",
                    Description="Light, comforting broth loaded with fresh vegetables for a clean, balanced bowl.",
                    PriceCents=2000, Currency=Currency.CAD, ImageUrl="/ramen/vegetable.png", SortOrder=5, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="c1", CategoryId="combo", Kind=MenuItemKind.food, Name="Pork Combo",
                    Description="Add-on combo featuring a savory pork side to pair perfectly with your main dish.",
                    PriceCents=700, Currency=Currency.CAD, ImageUrl="/porkCombo.png", SortOrder=100, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="c2", CategoryId="combo", Kind=MenuItemKind.food, Name="Cheese Combo",
                    Description="Add-on combo with a cheesy side—rich, melty, and satisfying.",
                    PriceCents=700, Currency=Currency.CAD, ImageUrl="/cheeseCombo.png", SortOrder=101, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="c3", CategoryId="combo", Kind=MenuItemKind.food, Name="Chicken Combo",
                    Description="Add-on combo featuring a tasty chicken side—crispy, juicy, and crowd-pleasing.",
                    PriceCents=700, Currency=Currency.CAD, ImageUrl="/chickenCombo.png", SortOrder=102, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="rice1", CategoryId="rice", Kind=MenuItemKind.food, Name="Curry Karaage Don",
                    Description="Japanese curry over rice topped with crispy karaage for a hearty, comforting bowl.",
                    PriceCents=2150, Currency=Currency.CAD, ImageUrl="/katsu/currydon.png", SortOrder=200, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="rice2", CategoryId="rice", Kind=MenuItemKind.food, Name="Tofu Teriyaki Don",
                    Description="Teriyaki-glazed tofu over rice—sweet, savory, and perfectly balanced.",
                    PriceCents=2100, Currency=Currency.CAD, ImageUrl="/katsu/tofudon.png", SortOrder=201, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="rice3", CategoryId="rice", Kind=MenuItemKind.food, Name="Chashu Rice",
                    Description="Steamed rice topped with tender chashu slices—simple, flavorful, and satisfying.",
                    PriceCents=1050, Currency=Currency.CAD, ImageUrl="/katsu/chashurice.png", SortOrder=202, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="u1", CategoryId="udon", Kind=MenuItemKind.food, Name="Seafood Tempura Udon",
                    Description="Hot udon in a light dashi broth with crispy seafood tempura on the side.",
                    PriceCents=2150, Currency=Currency.CAD, ImageUrl="/ramen/seafoodudon.png", SortOrder=300, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="u2", CategoryId="udon", Kind=MenuItemKind.food, Name="Kimchi Seafood Udon",
                    Description="Udon in a savory broth with kimchi and seafood—spicy, tangy, and comforting.",
                    PriceCents=2150, Currency=Currency.CAD, ImageUrl="/ramen/kimchiudon.png", SortOrder=301, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="u3", CategoryId="udon", Kind=MenuItemKind.food, Name="Curry Katsu Udon",
                    Description="Thick udon noodles served with Japanese curry and katsu—rich, hearty, and filling.",
                    PriceCents=2100, Currency=Currency.CAD, ImageUrl="/ramen/curryudon.png", SortOrder=302, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="u4", CategoryId="udon", Kind=MenuItemKind.food, Name="Cold Soba Noodle",
                    Description="Chilled soba noodles served refreshing and light—perfect with dipping sauce.",
                    PriceCents=1650, Currency=Currency.CAD, ImageUrl="/ramen/soba.png", SortOrder=303, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="u5", CategoryId="udon", Kind=MenuItemKind.food, Name="Spicy Mixed Soba Noodle",
                    Description="Chilled soba mixed with a spicy, savory sauce for a bold, refreshing bite.",
                    PriceCents=1750, Currency=Currency.CAD, ImageUrl="/ramen/soba.png", SortOrder=304, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t1", CategoryId="katsu", Kind=MenuItemKind.food, Name="Tonkatsu",
                    Description="Crispy pork cutlet served with rice, miso soup, and salad.",
                    PriceCents=2450, Currency=Currency.CAD, ImageUrl="/katsu/trio.png", SortOrder=400, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t2", CategoryId="katsu", Kind=MenuItemKind.food, Name="Cheese Katsu",
                    Description="Golden pork cutlet stuffed with melted cheese, served with rice, miso soup, and salad.",
                    PriceCents=2400, Currency=Currency.CAD, ImageUrl="/katsu/cheesekatsu.png", SortOrder=401, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t3", CategoryId="katsu", Kind=MenuItemKind.food, Name="Katsu Trio Set",
                    Description="A trio katsu set served with rice, miso soup, and salad—great for sharing.",
                    PriceCents=2400, Currency=Currency.CAD, ImageUrl="/katsu/trio.png", SortOrder=402, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t4", CategoryId="katsu", Kind=MenuItemKind.food, Name="Curry Katsu",
                    Description="Crispy katsu served with Japanese curry, rice, miso soup, and salad.",
                    PriceCents=2400, Currency=Currency.CAD, ImageUrl="/katsu/currykatsu.png", SortOrder=403, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t5", CategoryId="katsu", Kind=MenuItemKind.food, Name="Chicken Katsu",
                    Description="Crispy chicken cutlet served with rice, miso soup, and salad.",
                    PriceCents=2450, Currency=Currency.CAD, ImageUrl="/katsu/trio.png", SortOrder=404, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t6", CategoryId="katsu", Kind=MenuItemKind.food, Name="Ebi Katsu",
                    Description="Crispy breaded shrimp katsu served with rice, miso soup, and salad.",
                    PriceCents=2450, Currency=Currency.CAD, ImageUrl="/katsu/ebikatsu.png", SortOrder=405, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t7", CategoryId="katsu", Kind=MenuItemKind.food, Name="Fish Katsu",
                    Description="Light and crispy fish katsu served with rice, miso soup, and salad.",
                    PriceCents=2450, Currency=Currency.CAD, ImageUrl="/katsu/fishkatsu.png", SortOrder=406, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t8", CategoryId="katsu", Kind=MenuItemKind.food, Name="Tofu Katsu",
                    Description="Crispy tofu katsu served with rice, miso soup, and salad—delicious and satisfying.",
                    PriceCents=2450, Currency=Currency.CAD, ImageUrl="/katsu/tofukatsu.png", SortOrder=407, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t9", CategoryId="katsu", Kind=MenuItemKind.food, Name="Hamburg Steak",
                    Description="Juicy Japanese-style hamburger steak served with rice, miso soup, and salad.",
                    PriceCents=2950, Currency=Currency.CAD, ImageUrl="/katsu/hamburg.png", SortOrder=408, IsActive=true, CreatedAt=now, UpdatedAt=now },

                new() { Id="t10", CategoryId="katsu", Kind=MenuItemKind.food, Name="Beef Short Ribs",
                    Description="Tender beef short ribs served with rice, miso soup, and salad—rich and satisfying.",
                    PriceCents=2950, Currency=Currency.CAD, ImageUrl="/katsu/beefshortrib.png", SortOrder=409, IsActive=true, CreatedAt=now, UpdatedAt=now },
            };

            await db.MenuItems.AddRangeAsync(items);
            await db.SaveChangesAsync();
        }

        // =========================================================
        // 3) Options ONLY 
        // =========================================================
       
        if (await db.OptionGroups.AnyAsync() || await db.Options.AnyAsync() || await db.MenuItemOptionGroups.AnyAsync())
            return;

        // 3-1) OptionGroups
        var proteinGroup = new OptionGroup
        {
            Id = "protein_group",
            Kind = OptionGroupKind.protein,
            Title = "Choose Your Protein",
            Step = 1,
            Selection = OptionSelection.single,
            Required = true,
            MinSelected = 1,
            MaxSelected = 1,
            SortOrder = 1,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        var noodleGroup = new OptionGroup
        {
            Id = "noodle_group",
            Kind = OptionGroupKind.noodle,
            Title = "Choose Your Noodle",
            Step = 2,
            Selection = OptionSelection.single,
            Required = true,
            MinSelected = 1,
            MaxSelected = 1,
            SortOrder = 2,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        var toppingGroup = new OptionGroup
        {
            Id = "topping_group",
            Kind = OptionGroupKind.topping,
            Title = "Extra Ramen Topping",
            Step = 3,
            Selection = OptionSelection.multi,
            Required = false,
            MinSelected = 0,
            MaxSelected = 20,
            SortOrder = 3,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        await db.OptionGroups.AddRangeAsync(proteinGroup, noodleGroup, toppingGroup);
        await db.SaveChangesAsync();

        // 3-2) Options 
        var options = new List<Option>
        {
            // proteins
            new() { Id="protein_chashu", GroupId=proteinGroup.Id, Name="Chashu", Description="(Pork Slice)", PriceDeltaCents=0, Currency=Currency.CAD, ImageUrl="/toppings/chashu.png",
                MaxQty=1, DefaultQty=1, SortOrder=1, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="protein_karaage", GroupId=proteinGroup.Id, Name="Karaage", Description="(Deep Fried Chicken)", PriceDeltaCents=0, Currency=Currency.CAD, ImageUrl="/toppings/karaage.png",
                MaxQty=1, DefaultQty=1, SortOrder=2, IsActive=true, CreatedAt=now, UpdatedAt=now },

            // noodles
            new() { Id="noodle_thin", GroupId=noodleGroup.Id, Name="Thin Noodle", Description=null, PriceDeltaCents=0, Currency=Currency.CAD, ImageUrl="/toppings/thinnoodle.png",
                MaxQty=1, DefaultQty=1, SortOrder=1, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="noodle_regular", GroupId=noodleGroup.Id, Name="Regular Noodle", Description=null, PriceDeltaCents=0, Currency=Currency.CAD, ImageUrl="/toppings/noodle.png",
                MaxQty=1, DefaultQty=1, SortOrder=2, IsActive=true, CreatedAt=now, UpdatedAt=now },

            // toppings
            new() { Id="top_chashu", GroupId=toppingGroup.Id, Name="Chashu", PriceDeltaCents=400, Currency=Currency.CAD, ImageUrl="/toppings/chashu.png",
                MaxQty=20, DefaultQty=1, SortOrder=1, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_karaage", GroupId=toppingGroup.Id, Name="Karaage", PriceDeltaCents=400, Currency=Currency.CAD, ImageUrl="/toppings/karaage.png",
                MaxQty=20, DefaultQty=1, SortOrder=2, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_egg", GroupId=toppingGroup.Id, Name="Egg", PriceDeltaCents=300, Currency=Currency.CAD, ImageUrl="/toppings/egg.png",
                MaxQty=20, DefaultQty=1, SortOrder=3, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_beansprout", GroupId=toppingGroup.Id, Name="Beansprout", PriceDeltaCents=300, Currency=Currency.CAD, ImageUrl="/toppings/beansprout.png",
                MaxQty=20, DefaultQty=1, SortOrder=4, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_greenonion", GroupId=toppingGroup.Id, Name="Greenonion", PriceDeltaCents=300, Currency=Currency.CAD, ImageUrl="/toppings/greenonion.png",
                MaxQty=20, DefaultQty=1, SortOrder=5, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_broccoli", GroupId=toppingGroup.Id, Name="Broccoli", PriceDeltaCents=300, Currency=Currency.CAD, ImageUrl="/toppings/broccoli.png",
                MaxQty=20, DefaultQty=1, SortOrder=6, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_corn", GroupId=toppingGroup.Id, Name="Corn", PriceDeltaCents=300, Currency=Currency.CAD, ImageUrl="/toppings/corn.png",
                MaxQty=20, DefaultQty=1, SortOrder=7, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_fishcake", GroupId=toppingGroup.Id, Name="Fishcake", PriceDeltaCents=300, Currency=Currency.CAD, ImageUrl="/toppings/fishcake.png",
                MaxQty=20, DefaultQty=1, SortOrder=8, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_mushroom", GroupId=toppingGroup.Id, Name="Mushroom", PriceDeltaCents=300, Currency=Currency.CAD, ImageUrl="/toppings/mushroom.png",
                MaxQty=20, DefaultQty=1, SortOrder=9, IsActive=true, CreatedAt=now, UpdatedAt=now },
            new() { Id="top_seaweed", GroupId=toppingGroup.Id, Name="Seaweed", PriceDeltaCents=300, Currency=Currency.CAD, ImageUrl="/toppings/seaweed.png",
                MaxQty=20, DefaultQty=1, SortOrder=10, IsActive=true, CreatedAt=now, UpdatedAt=now },
        };

        await db.Options.AddRangeAsync(options);
        await db.SaveChangesAsync();

        // 3-3) Join groups to ramen items (r1~r5)
        var ramenIds = new[] { "r1", "r2", "r3", "r4", "r5" };

        var joins = ramenIds.SelectMany(menuItemId => new[]
        {
            new MenuItemOptionGroup
            {
                Id = Guid.NewGuid(),
                MenuItemId = menuItemId,
                GroupId = proteinGroup.Id,
                SortOrder = 1,
                RequiredOverride = true,
                MinSelectedOverride = 1,
                MaxSelectedOverride = 1,
                CreatedAt = now,
                UpdatedAt = now
            },
            new MenuItemOptionGroup
            {
                Id = Guid.NewGuid(),
                MenuItemId = menuItemId,
                GroupId = noodleGroup.Id,
                SortOrder = 2,
                RequiredOverride = true,
                MinSelectedOverride = 1,
                MaxSelectedOverride = 1,
                CreatedAt = now,
                UpdatedAt = now
            },
            new MenuItemOptionGroup
            {
                Id = Guid.NewGuid(),
                MenuItemId = menuItemId,
                GroupId = toppingGroup.Id,
                SortOrder = 3,
                RequiredOverride = false,
                MinSelectedOverride = 0,
                MaxSelectedOverride = 20,
                CreatedAt = now,
                UpdatedAt = now
            },
        }).ToList();

        await db.MenuItemOptionGroups.AddRangeAsync(joins);
        await db.SaveChangesAsync();
    }
}