| Component           | Asset location         | Expected behaviour                                             | Tested | Result                                    |
| ------------------- | ---------------------- | -------------------------------------------------------------- | ------ | ----------------------------------------- |
| Media download grid | PDF card               | Title followed by file type/size; thumbnail and download icon  | ✅      | PASS                                      |
| Media download grid | Image card             | Title followed by file type/size; thumbnail and download icon  |        |                                           |
| Media download grid | High-resolution image  | Title followed by file type/size; image available for download |        |                                           |
| Media download grid | Mixed file/image cards | All cards render correctly with metadata                       |        |                                           |
| Media download grid | Existing content       | No invalid asset schema warnings                               |        |                                           |
| Media download grid | New asset              | File/image can be added without schema warnings                | ✅      | PASS                                      |
| Media download grid | Untitled asset         | Behaviour requires clarification                               | ✅      | CAVEAT: untitled JPG/WEBP does not render |
| Intro/text          | Asset link             | File type/size immediately after title                         | ✅      | PASS                                      |
| Button              | Asset link             | File type/size immediately after title                         | ✅      | PASS                                      |
| Highlight banner    | Asset link             | File type/size immediately after title                         |        |                                           |
| Illustration banner | Asset link             | File type/size immediately after title                         |        |                                           |
| Image set           | Asset link             | File type/size immediately after title                         |        |                                           |
| List card banner    | Asset link             | File type/size immediately after title                         |        |                                           |
| List card grid      | Asset link             | File type/size immediately after title                         |        |                                           |
| Regular card grid   | Asset link             | File type/size immediately after title                         |        |                                           |
| Text image CTA      | Asset link             | File type/size immediately after title                         |        |                                           |