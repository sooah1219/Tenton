namespace Api.Models;

public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public abstract class StringEntity : BaseEntity
{
    public string Id { get; set; } = default!;
}

public abstract class GuidEntity : BaseEntity
{
    public Guid Id { get; set; }
}

public interface ISortable { int SortOrder { get; set; } }
public interface IActivatable { bool IsActive { get; set; } }