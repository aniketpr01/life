# The Walrus Operator in Python

Python 3.8 introduced the walrus operator (`:=`) for assignment expressions. It assigns values to variables as part of an expression.

```python
# Before Python 3.8
data = input("Enter data: ")
while data != "quit":
    process(data)
    data = input("Enter data: ")

# With walrus operator
while (data := input("Enter data: ")) != "quit":
    process(data)

# Useful in list comprehensions
numbers = [1, 2, 3, 4, 5]
squared = [y for x in numbers if (y := x**2) > 10]
print(squared)  # [16, 25]
```

**When to use:** When you need to both assign and use a value in a single expression.

*Date: January 8, 2025*
*Tags: #python #python38 #syntax*