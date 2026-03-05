namespace Api.Models;

public class Category : StringEntity, ISortable, IActivatable
{
    public string Name { get; set; } = "";
    public string? Icon { get; set; }

    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public List<MenuItem> MenuItems { get; set; } = new();
}

public class MenuItem : StringEntity, ISortable, IActivatable
{
    public string CategoryId { get; set; } = default!;
    public Category? Category { get; set; }

    public MenuItemKind Kind { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }

    public int PriceCents { get; set; }
    public Currency Currency { get; set; } = Currency.CAD;

    public string? ImageUrl { get; set; }

    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public List<MenuItemOptionGroup> OptionGroups { get; set; } = new();
}

public class OptionGroup : StringEntity, ISortable, IActivatable
{
    public OptionGroupKind Kind { get; set; }
    public string Title { get; set; } = "";
    public int Step { get; set; } // 1/2/3

    public OptionSelection Selection { get; set; }
    public bool Required { get; set; }

    public int MinSelected { get; set; }
    public int MaxSelected { get; set; }

    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public List<Option> Options { get; set; } = new();
}

public class Option : StringEntity, ISortable, IActivatable
{
    public string GroupId { get; set; } = default!;
    public OptionGroup? Group { get; set; }

    public string Name { get; set; } = "";
    public string? Description { get; set; }

    public int PriceDeltaCents { get; set; }
    public Currency Currency { get; set; } = Currency.CAD;

    public string? ImageUrl { get; set; }

    public int? MaxQty { get; set; }
    public int? DefaultQty { get; set; }

    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class MenuItemOptionGroup : BaseEntity, ISortable
{
    public Guid Id { get; set; } 

    public string MenuItemId { get; set; } = default!;
    public MenuItem? MenuItem { get; set; }

    public string GroupId { get; set; } = default!;
    public OptionGroup? Group { get; set; }

    public bool? RequiredOverride { get; set; }
    public int? MinSelectedOverride { get; set; }
    public int? MaxSelectedOverride { get; set; }

    public int SortOrder { get; set; }
}

public class MenuItemAllowedOption : BaseEntity
{
    public Guid Id { get; set; }

    public string MenuItemId { get; set; } = default!;
    public MenuItem? MenuItem { get; set; }

    public string OptionId { get; set; } = default!;
    public Option? Option { get; set; }
}