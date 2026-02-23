// DB

ALl table:

- timestamps
- id

// Table 1: Menu

- name
- description
- price
- category_id

// Table 3: Category

- name

// Table 2: MenuOption

- menu_id integer - non nullable
- required boolean - non nullable
- menu_option_step_id integer
- name noodle thin
- price

// Table 3: MenuOptionStep

- name // noodle - protein
- multiselect boolean

// Table 4: Order

- customer_id
- status - PENDING, CONFIRM, COMPLETE, CANCEL
- pickup_datetime

// Table 5: OrderEntry

- menu_id
- quantity
- note

// Table 6: OrderEntryMenuOption \*\*\*

- order_id
- menu_option_id

// Table 5: Customer

- name
- phone
- email
