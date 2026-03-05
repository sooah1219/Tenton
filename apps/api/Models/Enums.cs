namespace Api.Models;

public enum MenuItemKind { ramen = 1, food = 2, drink = 3 }
public enum Currency { CAD }

public enum OptionGroupKind { protein = 1, noodle = 2, topping = 3 }
public enum OptionSelection { single = 1, multi = 2 }

public enum OrderStatus { CONFIRMED = 0, CANCELLED = 1 }

public enum PaymentStatus { UNPAID = 0, PAID = 1 }
public enum PayMethod { store = 0, card = 1 }
