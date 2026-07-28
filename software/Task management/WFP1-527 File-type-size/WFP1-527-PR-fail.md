WFP1-527
Branch: feature/WFP1-527-file-format-and-size-annotation (JF)
Pull: pull/816
Review:
- Too many files to pass this
- Code
1) @ts-ignore everywhere = you’ve turned TypeScript off
2) You’re mutating fetched Sanity data in-place (and it’s easy to corrupt)
3) The algorithm is “nested forEach soup” with unclear intent
4) Your variable naming and types are sloppy
5) You’re one null away from runtime exceptions
6) Mixing architectural concerns — data fetching vs content transformation

The blunt conclusion

**A controlled demolition of safety**.

Right now this code is fragile, untyped, mutation-heavy, and too clever in the wrong place. It will absolutely produce bugs under real editorial content, and when it does you’ll be stuck debugging a nested loop maze with no type safety.