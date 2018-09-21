# web_one2many_selectable_10
## Usage in templates:

    <field name="One2many_name" widget="one2many_selectable" caption="your button caption" action="server_action" callback="javascript_callback">

If defined, "server_action" will be RPC called and executed by server
If defined, "javascript_callback" will be executed client side after "server_action" is executed server side,
if also defined. "javascript_callback" will be sent results returned from "server_action" if any.
