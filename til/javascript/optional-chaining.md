# Optional Chaining in JavaScript

Optional chaining (`?.`) allows you to safely access nested object properties, even if an intermediate property doesn't exist.

```javascript
// Instead of:
if (user && user.address && user.address.street) {
  console.log(user.address.street);
}

// You can write:
console.log(user?.address?.street);

// Works with methods too:
const result = someObject.customMethod?.();
```

**Gotcha:** It returns `undefined` if the chain breaks, not `null`.

*Date: January 8, 2025*
*Tags: #javascript #es2020 #syntax*