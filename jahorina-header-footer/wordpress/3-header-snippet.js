/* =====================================================================
   JAHORINA HEADER  (WPCode: JavaScript Snippet → Auto Insert → Site Wide Header)
   Sakriva stari Betheme header i prikazuje novi; stavke menija čita iz WordPressa
   (Izgled → Izbornici). Isključi snippet = vraća se stari header.
   Izgled je upakovan (base64) da ga server firewall ne bi blokirao.
   ===================================================================== */
(function () {
  if (window.__jahorinaHeader) return; window.__jahorinaHeader = true;
  function dec(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new TextDecoder().decode(u); }
  var HEAD = 'PGxpbmsgcmVsPSJwcmVjb25uZWN0IiBocmVmPSJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tIj4KPGxpbmsgcmVsPSJwcmVjb25uZWN0IiBocmVmPSJodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tIiBjcm9zc29yaWdpbj4KPGxpbmsgaHJlZj0iaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1BcmNoaXZvOndnaHRANTAwOzYwMDs3MDA7ODAwJmZhbWlseT1CYXJsb3c6d2dodEAzMDA7NDAwOzUwMDs2MDA7NzAwJmRpc3BsYXk9c3dhcCIgcmVsPSJzdHlsZXNoZWV0Ij4KPHN0eWxlPgogIC8qIHNha3JpaiBzdGFyaSBCZXRoZW1lIGhlYWRlciBpIG5qZWdvdiBib8SNbmkgbWVuaSAqLwogICNUb3BfYmFyLCAjQWN0aW9uX2JhciwgLm1mbi1oZWFkZXItdG1wbCwgI1NpZGVfc2xpZGUsICNib2R5X292ZXJsYXl7ZGlzcGxheTpub25lIWltcG9ydGFudH0KICAuamgtd3AsIC5qaC13cCAqLCAuamgtd3AgKjo6YmVmb3JlLCAuamgtd3AgKjo6YWZ0ZXJ7Ym94LXNpemluZzpib3JkZXItYm94fQogIC5qaC13cHtsaW5lLWhlaWdodDpub3JtYWw7dGV4dC1hbGlnbjpsZWZ0fQogIC5qaC13cCBhe3RleHQtZGVjb3JhdGlvbjpub25lIWltcG9ydGFudH0KICAvKiB0ZW1hIG1pamVuamEgc3RpbCBkdWdtYWRpIGkgaWtvbmljYSDigJQgemFkcsW+aSBuYcWhIGl6Z2xlZCAqLwogIC5qaC13cCBidXR0b257Zm9udC1mYW1pbHk6aW5oZXJpdDtsZXR0ZXItc3BhY2luZzpub3JtYWw7dGV4dC10cmFuc2Zvcm06bm9uZTttaW4td2lkdGg6MDttYXJnaW46MH0KICAuamgtd3AgLmpmLXJvdW5ke3BhZGRpbmc6MCFpbXBvcnRhbnQ7Ym9yZGVyOjAhaW1wb3J0YW50O2xpbmUtaGVpZ2h0OjEhaW1wb3J0YW50O2NvbG9yOiNmZmYhaW1wb3J0YW50fQogIC5qaC13cCBzdmdbZmlsbD0ibm9uZSJdLC5qaC13cCBzdmdbZmlsbD0ibm9uZSJdICo6bm90KFtmaWxsXSl7ZmlsbDpub25lIWltcG9ydGFudH0KICAuamgtd3Agc3ZnIFtzdHJva2U9ImN1cnJlbnRDb2xvciJde3N0cm9rZTpjdXJyZW50Q29sb3IhaW1wb3J0YW50fQogIC5qaC13cCAuamYtc2VhcmNoIGJ1dHRvbntwYWRkaW5nOjEycHggMjJweCFpbXBvcnRhbnQ7Ym9yZGVyOjAhaW1wb3J0YW50O2JvcmRlci1yYWRpdXM6NDBweCFpbXBvcnRhbnQ7bGluZS1oZWlnaHQ6MSFpbXBvcnRhbnR9CiAgLmpoLXdwIC5qZi1zZWFyY2ggaW5wdXR7aGVpZ2h0OjQ0cHg7Ym94LXNoYWRvdzpub25lIWltcG9ydGFudDtib3JkZXI6MCFpbXBvcnRhbnQ7bWFyZ2luOjAhaW1wb3J0YW50fQogIC5qaC13cHsKICAgIGZvbnQtZmFtaWx5OidCYXJsb3cnLHN5c3RlbS11aSxzYW5zLXNlcmlmO2NvbG9yOiNmZmY7CiAgfQogIC5qaC13cCBhe2NvbG9yOmluaGVyaXR9CiAgLyogPT09PT09PT09PT09PT09PT0gSEVBREVSID09PT09PT09PT09PT09PT09ICovCiAgLmpmLWhlYWRlcnsKICAgIHBvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDtyaWdodDowO3otaW5kZXg6MTAwOwogICAgcGFkZGluZzowIGNsYW1wKDE2cHgsM3Z3LDQ0cHgpOwogICAgdHJhbnNpdGlvbjpiYWNrZ3JvdW5kIC4zNXMgZWFzZSxib3gtc2hhZG93IC4zNXMgZWFzZSxiYWNrZHJvcC1maWx0ZXIgLjM1cyBlYXNlOwogIH0KICAuamYtaGVhZGVyX19pbm5lcnsKICAgIG1heC13aWR0aDoxNDQwcHg7bWFyZ2luOjAgYXV0bztoZWlnaHQ6OTJweDsKICAgIGRpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIGF1dG8gMWZyO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MjRweDsKICAgIHRyYW5zaXRpb246aGVpZ2h0IC4zNXMgZWFzZTsKICB9CiAgLyogcG9zbGlqZSBza3JvbG92YW5qYTogdGFtbm8gc3Rha2xvIHVtamVzdG8gYmlqZWxlIHRyYWtlICovCiAgLmpmLWhlYWRlci5pcy1zY3JvbGxlZHsKICAgIGJhY2tncm91bmQ6cmdiYSgxMCwxNywzMiwuNzIpOwogICAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6Ymx1cigxNnB4KSBzYXR1cmF0ZSgxNDAlKTtiYWNrZHJvcC1maWx0ZXI6Ymx1cigxNnB4KSBzYXR1cmF0ZSgxNDAlKTsKICAgIGJveC1zaGFkb3c6MCAxcHggMCByZ2JhKDI1NSwyNTUsMjU1LC4wOCksMCAxOHB4IDQwcHggLTI0cHggcmdiYSgwLDAsMCwuOCk7CiAgfQogIC5qZi1oZWFkZXIuaXMtc2Nyb2xsZWQgLmpmLWhlYWRlcl9faW5uZXJ7aGVpZ2h0OjcwcHh9CiAgLmpmLWxvZ297anVzdGlmeS1zZWxmOnN0YXJ0O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXJ9CiAgLmpmLWxvZ28gaW1ne2hlaWdodDo0NnB4O3dpZHRoOmF1dG87ZGlzcGxheTpibG9jazt0cmFuc2l0aW9uOmhlaWdodCAuMzVzIGVhc2V9CiAgLmpmLWhlYWRlci5pcy1zY3JvbGxlZCAuamYtbG9nbyBpbWd7aGVpZ2h0OjM4cHh9CgogIC5qZi1uYXZ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6Y2xhbXAoMThweCwyLjJ2dywzNnB4KX0KICAuamYtbmF2IGF7CiAgICBwb3NpdGlvbjpyZWxhdGl2ZTtmb250LXNpemU6MTZweDtmb250LXdlaWdodDo1MDA7Y29sb3I6cmdiYSgyNTUsMjU1LDI1NSwuODgpO3BhZGRpbmc6NnB4IDA7dHJhbnNpdGlvbjpjb2xvciAuMnM7CiAgfQogIC5qZi1uYXYgYTo6YWZ0ZXJ7CiAgICBjb250ZW50OiIiO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO2JvdHRvbTotMnB4O2hlaWdodDoycHg7Ym9yZGVyLXJhZGl1czoycHg7CiAgICBiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCg5MGRlZyx0cmFuc3BhcmVudCwjMDBCOUYyLCNmZmYsIzAwQjlGMix0cmFuc3BhcmVudCk7CiAgICBib3gtc2hhZG93OjAgMCAxMHB4IHJnYmEoMCwxODUsMjQyLC44KTt0cmFuc2Zvcm06c2NhbGVYKDApO3RyYW5zaXRpb246dHJhbnNmb3JtIC4zNXMgY3ViaWMtYmV6aWVyKC4yLC43LC4yLDEpOwogIH0KICAuamYtbmF2IGE6aG92ZXJ7Y29sb3I6I2ZmZn0KICAuamYtbmF2IGE6aG92ZXI6OmFmdGVyLC5qZi1uYXYgYVthcmlhLWN1cnJlbnQ9InBhZ2UiXTo6YWZ0ZXJ7dHJhbnNmb3JtOnNjYWxlWCgxKX0KCiAgLmpmLXRvb2xze2p1c3RpZnktc2VsZjplbmQ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweH0KICAuamYtbmF2IGF7bGluZS1oZWlnaHQ6MX0KCiAgLyogcHJldHJhZ2E6IHN0YWtsZW5vIHBvbGplIGlzcG9kIGhlYWRlcmEgKi8KICAuamYtc2VhcmNoewogICAgcG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7dG9wOjEwMCU7cGFkZGluZzoxMnB4IGNsYW1wKDE2cHgsM3Z3LDQ0cHgpIDE4cHg7CiAgICBvcGFjaXR5OjA7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLThweCk7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uOm9wYWNpdHkgLjI1cyx0cmFuc2Zvcm0gLjI1czsKICB9CiAgLmpoLXdwLmlzLXNlYXJjaC1vcGVuIC5qZi1zZWFyY2h7b3BhY2l0eToxO3RyYW5zZm9ybTpub25lO3BvaW50ZXItZXZlbnRzOmF1dG99CiAgLmpmLXNlYXJjaCAuamYtc2Zvcm17CiAgICBtYXgtd2lkdGg6NjQwcHg7bWFyZ2luOjAgYXV0bztkaXNwbGF5OmZsZXg7Z2FwOjEwcHg7cGFkZGluZzo2cHg7Ym9yZGVyLXJhZGl1czo0MHB4OwogICAgYmFja2dyb3VuZDpyZ2JhKDEwLDE3LDMyLC44Nik7LXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6Ymx1cigxNnB4KTtiYWNrZHJvcC1maWx0ZXI6Ymx1cigxNnB4KTsKICAgIGJveC1zaGFkb3c6aW5zZXQgM3B4IDNweCA4cHggcmdiYSgwLDAsMCwuNDIpLGluc2V0IC0zcHggLTNweCA3cHggcmdiYSg3OCwxMDQsMTUwLC4xNCksMCAxOHB4IDQwcHggLTIwcHggcmdiYSgwLDAsMCwuOCk7CiAgfQogIC5qZi1zZWFyY2ggaW5wdXR7ZmxleDoxO21pbi13aWR0aDowO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6I2ZmZjtwYWRkaW5nOjAgMThweDtmb250OjQwMCAxNS41cHggJ0Jhcmxvdycsc2Fucy1zZXJpZjtvdXRsaW5lOm5vbmV9CiAgLmpmLXNlYXJjaCBpbnB1dDo6cGxhY2Vob2xkZXJ7Y29sb3I6cmdiYSgyNTUsMjU1LDI1NSwuNDIpfQogIC5qZi1zZWFyY2ggYnV0dG9ue2JvcmRlcjowO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MTJweCAyMnB4O2JvcmRlci1yYWRpdXM6NDBweDtmb250OjcwMCAxNC41cHggJ0Jhcmxvdycsc2Fucy1zZXJpZjtjb2xvcjojZmZmOwogICAgYmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTQ1ZGVnLCMyQ0NCRjgsIzAwQTZEQik7Ym94LXNoYWRvdzowIDhweCAyMHB4IC04cHggcmdiYSgwLDE4NSwyNDIsLjcpLGluc2V0IDFweCAxcHggMCByZ2JhKDI1NSwyNTUsMjU1LC4zNSl9CiAgLmpmLXJvdW5kewogICAgd2lkdGg6NDJweDtoZWlnaHQ6NDJweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MDtjdXJzb3I6cG9pbnRlcjsKICAgIGRpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7CiAgICBiYWNrZ3JvdW5kOnJnYmEoMjMsMzQsNTYsLjc1KTtjb2xvcjojZmZmO2JveC1zaGFkb3c6NHB4IDRweCAxMHB4IHJnYmEoMCwwLDAsLjQyKSwtM3B4IC0zcHggOXB4IHJnYmEoNzgsMTA0LDE1MCwuMTYpLGluc2V0IDFweCAxcHggMCByZ2JhKDI1NSwyNTUsMjU1LC4wNSk7CiAgICBmb250OjcwMCAxMi41cHgvMSAnQXJjaGl2bycsc2Fucy1zZXJpZjtsZXR0ZXItc3BhY2luZzouNnB4OwogICAgdHJhbnNpdGlvbjpjb2xvciAuMnMsYm94LXNoYWRvdyAuMjVzOwogIH0KICAuamYtcm91bmQ6aG92ZXJ7Y29sb3I6IzAwQjlGMn0KICAuamYtcm91bmQ6YWN0aXZle2JveC1zaGFkb3c6aW5zZXQgM3B4IDNweCA4cHggcmdiYSgwLDAsMCwuNDIpLGluc2V0IC0zcHggLTNweCA3cHggcmdiYSg3OCwxMDQsMTUwLC4xNCl9CiAgLmpmLWJ1cmdlcntkaXNwbGF5Om5vbmV9CgogIC5qZi1tbmF2e2Rpc3BsYXk6bm9uZX0KICBAbWVkaWEgKG1heC13aWR0aDoxMTAwcHgpewogICAgLmpmLW5hdntkaXNwbGF5Om5vbmV9CiAgICAuamYtYnVyZ2Vye2Rpc3BsYXk6aW5saW5lLWZsZXh9CiAgICAuamYtaGVhZGVyX19pbm5lcntoZWlnaHQ6NzZweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW59CiAgICAuamYtbG9nbyBpbWd7aGVpZ2h0OjQwcHh9CiAgICAuamYtbW5hdnsKICAgICAgZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4OwogICAgICBwb3NpdGlvbjpmaXhlZDt0b3A6MDtyaWdodDowO2JvdHRvbTowO3dpZHRoOm1pbig4NnZ3LDM2MHB4KTt6LWluZGV4OjEyMDsKICAgICAgcGFkZGluZzo5NnB4IDE4cHggMjRweDtiYWNrZ3JvdW5kOiMxMTFhMmM7Ym94LXNoYWRvdzotMjBweCAwIDYwcHggcmdiYSgwLDAsMCwuNik7CiAgICAgIHRyYW5zZm9ybTp0cmFuc2xhdGVYKDEwNSUpO3RyYW5zaXRpb246dHJhbnNmb3JtIC4zNXMgY3ViaWMtYmV6aWVyKC4yLC43LC4yLDEpOwogICAgfQogICAgLmpmLW1uYXYgYXtwYWRkaW5nOjE1cHggMTZweDtib3JkZXItcmFkaXVzOjE0cHg7Zm9udC1zaXplOjE3cHg7Zm9udC13ZWlnaHQ6NTAwfQogICAgLmpmLW1uYXYgYTpob3Zlcntib3gtc2hhZG93Omluc2V0IDNweCAzcHggOHB4IHJnYmEoMCwwLDAsLjQyKSxpbnNldCAtM3B4IC0zcHggN3B4IHJnYmEoNzgsMTA0LDE1MCwuMTQpfQogICAgLmpoLXdwLmlzLW1lbnUtb3BlbiAuamYtbW5hdnt0cmFuc2Zvcm06bm9uZX0KICAgIC5qaC13cC5pcy1tZW51LW9wZW4gLmpmLWhlYWRlcnt6LWluZGV4OjEzMH0gICAvKiBoYW1idXJnZXIgb3N0YWplIHZpZGxqaXYgZGEgemF0dm9yaSBtZW5pICovCiAgICAuamYtc2hhZGV7cG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDt6LWluZGV4OjExMDtiYWNrZ3JvdW5kOnJnYmEoNCw4LDE4LC41NSk7b3BhY2l0eTowO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbjpvcGFjaXR5IC4zc30KICAgIC5qaC13cC5pcy1tZW51LW9wZW4gLmpmLXNoYWRle29wYWNpdHk6MTtwb2ludGVyLWV2ZW50czphdXRvfQogIH0KCiAgLyogcG9kbWVuaSBpeiBXb3JkUHJlc3NhIChucHIuIE8gbmFtYSkgKi8KICAuamgtd3AgLmpmLWRke3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXJ9CiAgLmpoLXdwIC5qZi1kZF9fdG9wOjpiZWZvcmV7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtyaWdodDotMTRweDt0b3A6NTAlO3dpZHRoOjZweDtoZWlnaHQ6NnB4O21hcmdpbi10b3A6LTVweDtib3JkZXItcmlnaHQ6MS42cHggc29saWQgY3VycmVudENvbG9yO2JvcmRlci1ib3R0b206MS42cHggc29saWQgY3VycmVudENvbG9yO3RyYW5zZm9ybTpyb3RhdGUoNDVkZWcpO29wYWNpdHk6Ljh9CiAgLmpoLXdwIC5qZi1kZF9fdG9we21hcmdpbi1yaWdodDoxMnB4fQogIC5qaC13cCAuamYtZGRfX21lbnV7cG9zaXRpb246YWJzb2x1dGU7dG9wOmNhbGMoMTAwJSArIDE0cHgpO2xlZnQ6LTE2cHg7bWluLXdpZHRoOjIyMHB4O3BhZGRpbmc6OHB4O2JvcmRlci1yYWRpdXM6MThweDtiYWNrZ3JvdW5kOnJnYmEoMTQsMjAsMzQsLjk2KTstd2Via2l0LWJhY2tkcm9wLWZpbHRlcjpibHVyKDE0cHgpO2JhY2tkcm9wLWZpbHRlcjpibHVyKDE0cHgpO2JvcmRlcjoxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwuMSk7Ym94LXNoYWRvdzowIDI0cHggNDhweCAtMTZweCByZ2JhKDAsMCwwLC43KTtvcGFjaXR5OjA7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoNnB4KTtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb246b3BhY2l0eSAuMnMsdHJhbnNmb3JtIC4yc30KICAuamgtd3AgLmpmLWRkLmlzLW9wZW4gPiAuamYtZGRfX21lbnV7b3BhY2l0eToxO3RyYW5zZm9ybTpub25lO3BvaW50ZXItZXZlbnRzOmF1dG99CiAgLmpoLXdwIC5qZi1kZF9fbWVudXt6LWluZGV4OjU7d2lkdGg6bWF4LWNvbnRlbnQ7bWF4LXdpZHRoOjMwMHB4fQogIC5qaC13cCAuamYtZGRfX21lbnUgYXtsaW5lLWhlaWdodDoxLjM1IWltcG9ydGFudH0KICAvKiBkdWJsamkgbml2bzogb3R2YXJhIHNlIHNhIHN0cmFuZSBrYWQgbWnFoSBzdGFuZSBuYSBzdGF2a3UgKi8KICAuamgtd3AgLmpmLWZseXtwb3NpdGlvbjpyZWxhdGl2ZX0KICAuamgtd3AgLmpmLWRkX19tZW51IGEuamYtZmx5X190b3B7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjtnYXA6MTRweH0KICAuamgtd3AgLmpmLWRkX19tZW51IGEuamYtZmx5X190b3A6OmJlZm9yZXtjb250ZW50OicnO29yZGVyOjI7ZmxleC1zaHJpbms6MDt3aWR0aDo2cHg7aGVpZ2h0OjZweDtib3JkZXItcmlnaHQ6MS42cHggc29saWQgY3VycmVudENvbG9yO2JvcmRlci10b3A6MS42cHggc29saWQgY3VycmVudENvbG9yO3RyYW5zZm9ybTpyb3RhdGUoNDVkZWcpO29wYWNpdHk6Ljd9CiAgLmpoLXdwIC5qZi1mbHkuaXMtb3BlbiA+IGEuamYtZmx5X190b3B7Y29sb3I6I2ZmZjtiYWNrZ3JvdW5kOnJnYmEoMjU1LDI1NSwyNTUsLjA3KX0KICAuamgtd3AgLmpmLWZseV9fbWVudXtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjEwMCU7dG9wOi04cHg7bWFyZ2luLWxlZnQ6MTBweDttaW4td2lkdGg6MjIwcHg7d2lkdGg6bWF4LWNvbnRlbnQ7bWF4LXdpZHRoOjMwMHB4O3BhZGRpbmc6OHB4O2JvcmRlci1yYWRpdXM6MThweDtiYWNrZ3JvdW5kOnJnYmEoMTQsMjAsMzQsLjk3KTtib3JkZXI6MXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsLjEpO2JveC1zaGFkb3c6MCAyNHB4IDQ4cHggLTE2cHggcmdiYSgwLDAsMCwuNyk7b3BhY2l0eTowO3RyYW5zZm9ybTp0cmFuc2xhdGVYKC02cHgpO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbjpvcGFjaXR5IC4ycyx0cmFuc2Zvcm0gLjJzfQogIC5qaC13cCAuamYtZmx5LmlzLW9wZW4gPiAuamYtZmx5X19tZW51e29wYWNpdHk6MTt0cmFuc2Zvcm06bm9uZTtwb2ludGVyLWV2ZW50czphdXRvfQogIC5qaC13cCAuamYtZmx5X19tZW51OjpiZWZvcmV7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtib3R0b206MDtsZWZ0Oi0xMnB4O3dpZHRoOjEycHh9CiAgLmpoLXdwIC5qZi1mbHktLWxlZnQgPiAuamYtZmx5X19tZW51e2xlZnQ6YXV0bztyaWdodDoxMDAlO21hcmdpbi1sZWZ0OjA7bWFyZ2luLXJpZ2h0OjEwcHg7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoNnB4KX0KICAuamgtd3AgLmpmLWZseS0tbGVmdCA+IC5qZi1mbHlfX21lbnU6OmJlZm9yZXtsZWZ0OmF1dG87cmlnaHQ6LTEycHh9CiAgLmpoLXdwIC5qZi1mbHktLWxlZnQuaXMtb3BlbiA+IC5qZi1mbHlfX21lbnV7dHJhbnNmb3JtOm5vbmV9CiAgLmpoLXdwIC5qZi1kZF9fbWVudSBhLmpmLWRkX19kZWVwe3BhZGRpbmctbGVmdDoyOHB4O2ZvbnQtc2l6ZToxMy41cHg7Y29sb3I6cmdiYSgyNTUsMjU1LDI1NSwuNjYpfQogIC5qaC13cCAuamYtbW5hdiBhLmpmLW1uYXZfX2RlZXB7cGFkZGluZy1sZWZ0OjQ4cHg7Zm9udC1zaXplOjE0cHh9CiAgLmpoLXdwIC5qZi1kZF9fbWVudTo6YmVmb3Jle2NvbnRlbnQ6Jyc7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7dG9wOi0xNnB4O2hlaWdodDoxNnB4fQogIC5qaC13cCAuamYtZGRfX21lbnUgYXtkaXNwbGF5OmJsb2NrO3BhZGRpbmc6MTFweCAxNHB4O2JvcmRlci1yYWRpdXM6MTJweDtmb250LXNpemU6MTQuNXB4O2NvbG9yOnJnYmEoMjU1LDI1NSwyNTUsLjg2KX0KICAuamgtd3AgLmpmLWRkX19tZW51IGE6OmFmdGVye2Rpc3BsYXk6bm9uZX0KICAuamgtd3AgLmpmLWRkX19tZW51IGE6aG92ZXJ7Y29sb3I6I2ZmZjtiYWNrZ3JvdW5kOnJnYmEoMjU1LDI1NSwyNTUsLjA3KX0KICAuamgtd3AgLmpmLW1uYXYgYS5qZi1tbmF2X19zdWJ7cGFkZGluZzoxMHB4IDE2cHggMTBweCAzMnB4O2ZvbnQtc2l6ZToxNXB4O2NvbG9yOnJnYmEoMjU1LDI1NSwyNTUsLjcpfQogIGJvZHkuYWRtaW4tYmFyIC5qZi1oZWFkZXJ7dG9wOjMycHh9CiAgLyogdXZpamVrIGl6bmFkIGVsZW1lbmF0YSB0ZW1lIChzbGFqZGVyaSwga29sYcSNacSHaSwgQmV0aGVtZSBzbG9qZXZpKSAqLwogIC5qaC13cCAuamYtaGVhZGVye3otaW5kZXg6OTk5OTAhaW1wb3J0YW50fQogIC5qaC13cCAuamYtc2hhZGV7ei1pbmRleDo5OTk5MSFpbXBvcnRhbnR9CiAgLmpoLXdwIC5qZi1tbmF2e3otaW5kZXg6OTk5OTIhaW1wb3J0YW50O292ZXJmbG93LXk6YXV0bzstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaH0KICAuamgtd3AuaXMtbWVudS1vcGVuIC5qZi1oZWFkZXJ7ei1pbmRleDo5OTk5MyFpbXBvcnRhbnR9CiAgLmpoLXdwIGJ1dHRvbiwuamgtd3AgYXt0b3VjaC1hY3Rpb246bWFuaXB1bGF0aW9uOy13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjp0cmFuc3BhcmVudH0KICAuamgtd3AgLmpmLW1uYXYgYXtkaXNwbGF5OmJsb2NrO2NvbG9yOiNmZmYhaW1wb3J0YW50fQogIC5qaC13cDpub3QoLmlzLW1lbnUtb3BlbikgLmpmLW1uYXZ7Ym94LXNoYWRvdzpub25lIWltcG9ydGFudDt2aXNpYmlsaXR5OmhpZGRlbjt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMzVzIGN1YmljLWJlemllciguMiwuNywuMiwxKSx2aXNpYmlsaXR5IDBzIC4zNXN9CiAgLmpoLXdwIC5qZi1tYWNjX19yb3d7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcn0KICAuamgtd3AgLmpmLW1hY2NfX3JvdyA+IGF7ZmxleDoxfQogIC5qaC13cCAuamYtbWFjY19fYnRue2ZsZXg6MCAwIDQ0cHg7d2lkdGg6NDRweDtoZWlnaHQ6NDRweDtib3JkZXI6MCFpbXBvcnRhbnQ7cGFkZGluZzowIWltcG9ydGFudDtib3JkZXItcmFkaXVzOjEycHg7YmFja2dyb3VuZDpyZ2JhKDI1NSwyNTUsMjU1LC4wNSkhaW1wb3J0YW50O3Bvc2l0aW9uOnJlbGF0aXZlO2N1cnNvcjpwb2ludGVyO2JveC1zaGFkb3c6bm9uZSFpbXBvcnRhbnR9CiAgLmpoLXdwIC5qZi1tYWNjX19idG46OmJlZm9yZXtjb250ZW50OicnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6NTAlO3RvcDo1MCU7d2lkdGg6OHB4O2hlaWdodDo4cHg7bWFyZ2luOi02cHggMCAwIC00cHg7Ym9yZGVyLXJpZ2h0OjJweCBzb2xpZCAjZmZmO2JvcmRlci1ib3R0b206MnB4IHNvbGlkICNmZmY7dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZyk7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjI1c30KICAuamgtd3AgLmpmLW1hY2MuaXMtb3BlbiA+IC5qZi1tYWNjX19yb3cgPiAuamYtbWFjY19fYnRuOjpiZWZvcmV7dHJhbnNmb3JtOnJvdGF0ZSgtMTM1ZGVnKTttYXJnaW4tdG9wOi0ycHh9CiAgLmpoLXdwIC5qZi1tYWNjX19saXN0e2Rpc3BsYXk6bm9uZTtwYWRkaW5nOjJweCAwIDhweH0KICAuamgtd3AgLmpmLW1hY2MuaXMtb3BlbiA+IC5qZi1tYWNjX19saXN0e2Rpc3BsYXk6YmxvY2t9CiAgLmpoLXdwIC5qZi1tYWNjLmlzLW9wZW4gPiAuamYtbWFjY19fcm93ID4gYXtjb2xvcjojMDBCOUYyIWltcG9ydGFudH0KICAuamgtd3AgLmpmLW1uYXYgYS5qZi1tbmF2X19zdWJ7Y29sb3I6cmdiYSgyNTUsMjU1LDI1NSwuNzUpIWltcG9ydGFudH0KICAuamgtd3AgLmpmLW1hY2NfX2xpc3QgLmpmLW1hY2NfX2xpc3R7bWFyZ2luOjAgMCA0cHggMjJweDtwYWRkaW5nOjAgMCA0cHg7Ym9yZGVyLWxlZnQ6MXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsLjEpfQogIC5qaC13cCAuamYtbWFjY19fbGlzdCAuamYtbWFjY19fbGlzdCBhLmpmLW1uYXZfX3N1YntwYWRkaW5nLWxlZnQ6MThweH0KICAuamgtd3AgLmpmLW1hY2NfX2xpc3QgLmpmLW1hY2NfX2J0bntmbGV4LWJhc2lzOjM4cHg7d2lkdGg6MzhweDtoZWlnaHQ6MzhweH0KICBAbWVkaWEgKG1heC13aWR0aDo3ODJweCl7IGJvZHkuYWRtaW4tYmFyIC5qZi1oZWFkZXJ7dG9wOjQ2cHh9IH0KICBAbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246cmVkdWNlKXsuamgtd3AgKnt0cmFuc2l0aW9uOm5vbmUhaW1wb3J0YW50fX0KPC9zdHlsZT4K';
  var BODY = 'PGRpdiBjbGFzcz0iamYgamgtd3AiPgogIDxoZWFkZXIgY2xhc3M9ImpmLWhlYWRlciI+CiAgICA8ZGl2IGNsYXNzPSJqZi1oZWFkZXJfX2lubmVyIj4KICAgICAgPGEgaHJlZj0iaHR0cHM6Ly93d3cub2MtamFob3JpbmEuY29tLyIgY2xhc3M9ImpmLWxvZ28iPjxpbWcgc3JjPSJodHRwczovL29jLWphaG9yaW5hLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wOS9sb2dvLXdoaXRlLWxvY2t1cC5wbmciIGFsdD0iSmFob3JpbmEg4oCUIE9saW1waWpza2kgY2VudGFyIj48L2E+CiAgICAgIDxuYXYgY2xhc3M9ImpmLW5hdiIgYXJpYS1sYWJlbD0iR2xhdm5pIG1lbmkiPgogICAgICAgIDxhIGhyZWY9Imh0dHBzOi8vd3d3Lm9jLWphaG9yaW5hLmNvbS9vLW5hbWEvIj5PIG5hbWE8L2E+CiAgICAgICAgPGEgaHJlZj0iaHR0cHM6Ly93d3cub2MtamFob3JpbmEuY29tL2NqZW5vdm5pay8iPkNqZW5vdm5pazwvYT4KICAgICAgICA8YSBocmVmPSJodHRwczovL3d3dy5vYy1qYWhvcmluYS5jb20vdmlqZXN0aS8iPlZpamVzdGk8L2E+CiAgICAgICAgPGEgaHJlZj0iaHR0cHM6Ly93d3cub2MtamFob3JpbmEuY29tL2ZvdG8tZ2FsZXJpamEvIj5Gb3RvIGdhbGVyaWphPC9hPgogICAgICAgIDxhIGhyZWY9Imh0dHBzOi8vd3d3Lm9jLWphaG9yaW5hLmNvbS92aWRlby1nYWxlcmlqYS8iPlZpZGVvIGdhbGVyaWphPC9hPgogICAgICA8L25hdj4KICAgICAgPGRpdiBjbGFzcz0iamYtdG9vbHMiPgogICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iamYtcm91bmQgamYtc2VhcmNoLWJ0biIgYXJpYS1sYWJlbD0iUHJldHJhZ2EiIGFyaWEtZXhwYW5kZWQ9ImZhbHNlIj4KICAgICAgICAgIDxzdmcgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIGFyaWEtaGlkZGVuPSJ0cnVlIj48Y2lyY2xlIGN4PSIxMSIgY3k9IjExIiByPSI2LjUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMTYgMTYgTDIwIDIwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4KICAgICAgICA8L2J1dHRvbj4KICAgICAgICA8YSBocmVmPSJodHRwczovL3d3dy5vYy1qYWhvcmluYS5jb20vZW4vIiBjbGFzcz0iamYtcm91bmQgamYtbGFuZyIgYXJpYS1sYWJlbD0iRW5nbGlzaCI+RU48L2E+CiAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJqZi1yb3VuZCBqZi1idXJnZXIiIGFyaWEtbGFiZWw9Ik90dm9yaSBtZW5pIiBhcmlhLWV4cGFuZGVkPSJmYWxzZSI+CiAgICAgICAgICA8c3ZnIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBhcmlhLWhpZGRlbj0idHJ1ZSI+PHBhdGggZD0iTTQgNyBIMjAgTTQgMTIgSDIwIE00IDE3IEgyMCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+CiAgICAgICAgPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJqZi1zZWFyY2giPgogICAgICA8ZGl2IGNsYXNzPSJqZi1zZm9ybSIgcm9sZT0ic2VhcmNoIiBkYXRhLWFjdGlvbj0iaHR0cHM6Ly93d3cub2MtamFob3JpbmEuY29tLyI+CiAgICAgICAgPGxhYmVsIGZvcj0iamYtcyIgc3R5bGU9InBvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTk5OTlweCI+UHJldHJhZ2E8L2xhYmVsPgogICAgICAgIDxpbnB1dCBpZD0iamYtcyIgdHlwZT0ic2VhcmNoIiBwbGFjZWhvbGRlcj0iUHJldHJhxb5pIHNhanTigKYiIGF1dG9jb21wbGV0ZT0ib2ZmIj4KICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiI+VHJhxb5pPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgPC9oZWFkZXI+CiAgPGRpdiBjbGFzcz0iamYtc2hhZGUiPjwvZGl2PgogIDxuYXYgY2xhc3M9ImpmLW1uYXYiIGFyaWEtbGFiZWw9Ik1lbmkgemEgdGVsZWZvbiI+CiAgICA8YSBocmVmPSJodHRwczovL3d3dy5vYy1qYWhvcmluYS5jb20vby1uYW1hLyI+TyBuYW1hPC9hPgogICAgPGEgaHJlZj0iaHR0cHM6Ly93d3cub2MtamFob3JpbmEuY29tL2NqZW5vdm5pay8iPkNqZW5vdm5pazwvYT4KICAgIDxhIGhyZWY9Imh0dHBzOi8vd3d3Lm9jLWphaG9yaW5hLmNvbS92aWplc3RpLyI+VmlqZXN0aTwvYT4KICAgIDxhIGhyZWY9Imh0dHBzOi8vd3d3Lm9jLWphaG9yaW5hLmNvbS9mb3RvLWdhbGVyaWphLyI+Rm90byBnYWxlcmlqYTwvYT4KICAgIDxhIGhyZWY9Imh0dHBzOi8vd3d3Lm9jLWphaG9yaW5hLmNvbS92aWRlby1nYWxlcmlqYS8iPlZpZGVvIGdhbGVyaWphPC9hPgogIDwvbmF2Pgo8L2Rpdj4K';
  (document.head || document.documentElement).insertAdjacentHTML('beforeend', dec(HEAD));

function jhInit() {
  var root = document.querySelector('.jh-wp');
  if (!root) return;
  // header uvijek ide na sam početak stranice, bez obzira gdje ga WPCode ubaci
  function toTop() { if (document.body && document.body.firstChild !== root) document.body.insertBefore(root, document.body.firstChild); }
  toTop(); document.addEventListener('DOMContentLoaded', toTop);

  var header = root.querySelector('.jf-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40 || root.classList.contains('is-search-open')); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var burger = root.querySelector('.jf-burger'), shade = root.querySelector('.jf-shade');
  function setMenu(open) { root.classList.toggle('is-menu-open', open); burger.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('is-menu-open')); });
  shade.addEventListener('click', function () { setMenu(false); });

  var sBtn = root.querySelector('.jf-search-btn'), sInput = root.querySelector('.jf-search input');
  function setSearch(open) {
    root.classList.toggle('is-search-open', open); sBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    onScroll(); if (open) setTimeout(function () { sInput.focus(); }, 60);
  }
  sBtn.addEventListener('click', function (e) { e.stopPropagation(); setSearch(!root.classList.contains('is-search-open')); });
  document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.jf-header')) setSearch(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setSearch(false); setMenu(false); } });
  var sForm = root.querySelector('.jf-search .jf-sform');
  function doSearch() {
    var v = sInput.value.trim(); if (!v) return;
    window.location.assign((sForm.getAttribute('data-action') || '/') + '?s=' + encodeURIComponent(v));
  }
  sForm.querySelector('button').addEventListener('click', doSearch);
  sInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });

  // ===== MENI IZ WORDPRESSA: stavke se čitaju iz postojećeg Betheme menija =====
  // (Izgled → Izbornici ostaje jedino mjesto gdje se meni uređuje)
  var srcUl = document.querySelector('#Top_bar #menu > ul, #Top_bar .menu_wrapper ul.menu, .mfn-header-tmpl nav ul, #menu-main-menu');
  var fromWP = false;
  function kids(ul) { return ul ? [].filter.call(ul.children, function (li) { return li.tagName === 'LI' && li.querySelector('a'); }) : []; }
  function subOf(li) { return li.querySelector(':scope > ul, :scope > div > ul'); }
  function isDead(h) { return !h || h === '#' || /#$/.test(h); }
  function mk(li) {   // kopija linka iz WordPress menija (isti tekst, ista adresa)
    var a0 = li.querySelector(':scope > a') || li.querySelector('a');
    var label = (a0.textContent || '').replace(/\s+/g, ' ').trim(); if (!label) return null;
    var a = document.createElement('a'); a.setAttribute('href', a0.getAttribute('href') || '#'); a.textContent = label;
    if (a0.target) a.target = a0.target;
    if (/current-menu-(item|ancestor|parent)/.test(li.className)) a.setAttribute('aria-current', 'page');
    return a;
  }
  function el(tag, cls) { var n = document.createElement(tag); n.className = cls; return n; }
  var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;

  // računar: podmeni se otvara prelaskom miša; dublji nivo se otvara sa strane tek kad miš stane na svoju stavku
  function place(node, menu, down) {
    menu.style.left = ''; menu.style.right = ''; menu.style.top = ''; node.classList.remove('jf-fly--left');
    var r = menu.getBoundingClientRect();
    if (down) { if (r.right > window.innerWidth - 12) { menu.style.left = 'auto'; menu.style.right = '-16px'; } return; }
    if (r.right > window.innerWidth - 12) node.classList.add('jf-fly--left');
    var over = r.bottom - (window.innerHeight - 12); if (over > 0) menu.style.top = (-8 - over) + 'px';
  }
  function hoverable(node, menu, down) {
    var timer, pend, top = node.firstElementChild;
    function doOpen() {
      [].forEach.call(node.parentElement.children, function (s) { if (s !== node && s.classList.contains('is-open')) shut(s); });
      if (!node.classList.contains('is-open')) { node.classList.add('is-open'); place(node, menu, down); }
    }
    function open(e) {
      clearTimeout(timer); clearTimeout(pend);
      // miš ide dijagonalno ka otvorenom podmeniju preko susjedne stavke — ne zatvaraj ga odmah
      var busy = !down && [].some.call(node.parentElement.children, function (s) { return s !== node && s.classList.contains('is-open'); });
      if (busy && e && e.type === 'mouseenter') pend = setTimeout(doOpen, 200); else doOpen();
    }
    function later() { clearTimeout(timer); clearTimeout(pend); timer = setTimeout(function () { shut(node); }, 300); }
    if (!touch) { node.addEventListener('mouseenter', open); node.addEventListener('mouseleave', later); }
    node.addEventListener('focusin', open);
    node.addEventListener('focusout', function (e) { if (!node.contains(e.relatedTarget)) later(); });
    top.addEventListener('click', function (e) {
      if (touch && !node.classList.contains('is-open')) { e.preventDefault(); open(); return; }   // tablet: 1. dodir otvara
      if (isDead(top.getAttribute('href'))) e.preventDefault();                                   // "#" ne vodi nigdje
    });
  }
  function shut(n) { n.classList.remove('is-open'); [].forEach.call(n.querySelectorAll('.is-open'), function (x) { x.classList.remove('is-open'); }); }
  function deskList(ul, box) {
    kids(ul).forEach(function (li) {
      var a = mk(li); if (!a) return;
      var sub = subOf(li);
      if (kids(sub).length) {
        var fly = el('div', 'jf-fly'), m = el('div', 'jf-fly__menu');
        a.classList.add('jf-fly__top'); fly.appendChild(a); fly.appendChild(m); box.appendChild(fly);
        deskList(sub, m); hoverable(fly, m, false);
      } else box.appendChild(a);
    });
  }
  // telefon: harmonika po nivoima — strelica otvara podstavke, naziv vodi na stranicu ("#" stavka otvara podstavke)
  function mobList(ul, box, depth) {
    kids(ul).forEach(function (li) {
      var a = mk(li); if (!a) return;
      if (depth) a.className = 'jf-mnav__sub';
      var sub = subOf(li);
      if (!kids(sub).length) { box.appendChild(a); return; }
      var acc = el('div', 'jf-macc'), row = el('div', 'jf-macc__row'), tg = el('button', 'jf-macc__btn'), list = el('div', 'jf-macc__list');
      tg.type = 'button'; tg.setAttribute('aria-label', a.textContent); tg.setAttribute('aria-expanded', 'false');
      row.appendChild(a); row.appendChild(tg); acc.appendChild(row); acc.appendChild(list); box.appendChild(acc);
      function flip(e) { e.preventDefault(); var o = !acc.classList.contains('is-open'); acc.classList.toggle('is-open', o); tg.setAttribute('aria-expanded', o ? 'true' : 'false'); }
      tg.addEventListener('click', flip);
      if (isDead(a.getAttribute('href'))) a.addEventListener('click', flip);
      mobList(sub, list, depth + 1);
    });
  }
  if (srcUl && kids(srcUl).length) {
    fromWP = true;
    var nav = root.querySelector('.jf-nav'), mnav = root.querySelector('.jf-mnav');
    nav.innerHTML = ''; mnav.innerHTML = '';
    kids(srcUl).forEach(function (li) {
      var a = mk(li); if (!a) return;
      var sub = subOf(li);
      if (kids(sub).length) {
        var wrap = el('div', 'jf-dd'), box = el('div', 'jf-dd__menu');
        a.classList.add('jf-dd__top'); wrap.appendChild(a); wrap.appendChild(box); nav.appendChild(wrap);
        deskList(sub, box); hoverable(wrap, box, true);
      } else nav.appendChild(a);
    });
    mobList(srcUl, mnav, 0);
    document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.jf-nav')) [].forEach.call(nav.querySelectorAll('.is-open'), shut); });
  }
  function clearHeader() {
    if (document.querySelector('rs-module, .rev_slider, rs-module-wrap, .rev_slider_wrapper')) return;   // hero stranica: header ide preko slike
    var hh = header.offsetHeight, y = window.scrollY || 0;
    var sh = document.querySelector('#Subheader'), box = sh || document.querySelector('#Content');
    if (!box) return;
    box.style.paddingTop = '';
    var ref = (sh && sh.querySelector('.title, h1, h2')) || box.firstElementChild || box;
    var topY = ref.getBoundingClientRect().top + y, need = hh + 14 - topY;
    if (need > 0) box.style.paddingTop = (parseFloat(getComputedStyle(box).paddingTop) + need) + 'px';
  }
  clearHeader(); window.addEventListener('load', clearHeader);
  var rT; window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(clearHeader, 150); });
  root.classList.add('is-ready');   // tek sada pokaži meni (bez treptaja pogrešnih stavki)
  // jezik: na srpskoj strani dugme "EN" vodi na istu stranicu na engleskom, i obrnuto
  var path = location.pathname, isEN = /^\/en(\/|$)/.test(path);
  // WPML u <head> upisuje adrese iste stranice na svim jezicima (hreflang) — to je najpouzdanije
  var wpLang = null;
  [].some.call(document.querySelectorAll('link[rel="alternate"][hreflang]'), function (l) {
    var hl = (l.getAttribute('hreflang') || '').toLowerCase();
    if (hl === 'x-default' || !l.href) return false;
    var linkEN = hl.indexOf('en') === 0;
    if (linkEN !== isEN) { wpLang = l.href; return true; }
    return false;
  });
  if (!wpLang) {   // rezerva: link za jezik iz Betheme/WPML menija, ali samo onaj koji vodi na DRUGI jezik
    [].some.call(document.querySelectorAll('.wpml-languages a, .wpml-ls a, a[hreflang], .lang-item a'), function (a) {
      if (!a.href || a.href.split('#')[0] === location.href.split('#')[0]) return false;
      var p = a.pathname || '', toEN = /^\/en(\/|$)/.test(p);
      if (toEN !== isEN) { wpLang = a.href; return true; }
      return false;
    });
  }
  var lang = root.querySelector('.jf-lang');
  lang.href = wpLang || location.origin + (isEN ? (path.replace(/^\/en/, '') || '/') : '/en' + path);
  lang.textContent = isEN ? 'SR' : 'EN';
  lang.setAttribute('aria-label', isEN ? 'Srpski' : 'English');
  if (!isEN) return;
  if (fromWP) {   // meni je već na pravom jeziku iz WordPressa — prevedi samo pretragu
    var f0 = root.querySelector('.jf-search .jf-sform');
    f0.setAttribute('data-action', 'https://www.oc-jahorina.com/en/'); sInput.placeholder = 'Search the site…';
    f0.querySelector('button').textContent = 'Search'; sBtn.setAttribute('aria-label', 'Search');
    return;
  }
  var T = { 'O nama': 'About us', 'Cjenovnik': 'Pricelist', 'Vijesti': 'News', 'Foto galerija': 'Photo gallery', 'Video galerija': 'Video gallery' };
  root.querySelectorAll('.jf-nav a, .jf-mnav a').forEach(function (a) {
    var t = a.textContent.trim(); if (T[t]) a.textContent = T[t];
  });
  root.querySelectorAll('a[href^="https://www.oc-jahorina.com/"]').forEach(function (a) {
    if (a !== lang && !/oc-jahorina\.com\/en\//.test(a.href)) a.href = a.href.replace('oc-jahorina.com/', 'oc-jahorina.com/en/');
  });
  var f = root.querySelector('.jf-search .jf-sform');
  f.setAttribute('data-action', 'https://www.oc-jahorina.com/en/');
  sInput.placeholder = 'Search the site…';
  f.querySelector('button').textContent = 'Search';
  sBtn.setAttribute('aria-label', 'Search');
}
  function start() { document.body.insertAdjacentHTML('afterbegin', dec(BODY)); jhInit(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
