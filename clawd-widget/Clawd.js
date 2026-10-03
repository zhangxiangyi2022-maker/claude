// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: heart;

// Clawd 桌宠小组件（Scriptable）
// - 主屏幕小组件：显示 Clawd 的表情、饱腹、心情和一句话
// - 中号 / 大号小组件带按钮：喂饼干、摸摸、打开 Claude
// - 点 Clawd 本身：打开可以拖来拖去、喂饼干的完整版桌宠
// - 也支持锁屏小组件（圆形 / 矩形 / 单行）
//
// 这个文件由 build.py 从 Clawd.src.js 和 pet.html 生成，改代码请改那两个文件。

const CLAUDE_URL = "https://claude.ai/new";
const PET_HTML_B64 = "PCFkb2N0eXBlIGh0bWw+CjxodG1sIGxhbmc9InpoLUNOIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLCB2aWV3cG9ydC1maXQ9Y292ZXIsIHVzZXItc2NhbGFibGU9bm8iPgo8dGl0bGU+Q2xhd2Qg5qGM5a6gPC90aXRsZT4KPGxpbmsgcmVsPSJwcmVjb25uZWN0IiBocmVmPSJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tIj4KPGxpbmsgcmVsPSJwcmVjb25uZWN0IiBocmVmPSJodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tIiBjcm9zc29yaWdpbj4KPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PVNpbGtzY3JlZW4mZGlzcGxheT1zd2FwIj4KPHN0eWxlPgovKiBMYXlvdXQ6IG9uZS1zY3JlZW4gYXBwIOKAlCBhICJtb25pdG9yIiBzdGFnZSB3aGVyZSB0aGUgcGV0IGxpdmVzLCB3aXRoIGEgc3RhdHVzL2NvbnRyb2wgZG9jayBiZWxvdyAqLwo6cm9vdCB7CiAgLS1iZzogI2U0ZTdlYzsKICAtLXNjcmVlbjogI2YzZjVmODsKICAtLXNjcmVlbi1kb3Q6ICNkNmRiZTM7CiAgLS1kZXNrOiAjY2RiOWEwOwogIC0tZGVzay1lZGdlOiAjYjI5YTdkOwogIC0tZmc6ICMyMjI1MmI7CiAgLS1tdXRlZDogIzZiNzI4MDsKICAtLWZyYW1lOiAjMmIyZTM1OwogIC0tZG9jazogI2ZmZmZmZjsKICAtLWxpbmU6ICNkM2Q4ZTA7CiAgLS1hY2NlbnQ6ICNkOTc3NTc7CiAgLS1hY2NlbnQtaW5rOiAjZmZmZmZmOwogIC0tYnViYmxlOiAjZmZmZmZmOwogIC0tYnViYmxlLWluazogIzIyMjUyYjsKICAtLWJhci1mb29kOiAjZTBhMjRhOwogIC0tYmFyLW1vb2Q6ICNlNDZmOGY7CiAgLS1mb250LXBpeGVsOiAiU2lsa3NjcmVlbiIsIHVpLW1vbm9zcGFjZSwgIlNGTW9uby1SZWd1bGFyIiwgTWVubG8sIG1vbm9zcGFjZTsKICAtLWZvbnQtYm9keTogc3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCAiUGluZ0ZhbmcgU0MiLCAiTWljcm9zb2Z0IFlhSGVpIiwgIk5vdG8gU2FucyBTQyIsIHNhbnMtc2VyaWY7Cn0KQG1lZGlhIChwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaykgewogIDpyb290Om5vdChbZGF0YS10aGVtZT0ibGlnaHQiXSkgewogICAgLS1iZzogIzEwMTIxNjsgLS1zY3JlZW46ICMxODFiMjE7IC0tc2NyZWVuLWRvdDogIzI2MmEzMzsgLS1kZXNrOiAjM2EzMTI5OyAtLWRlc2stZWRnZTogIzRhM2YzNDsKICAgIC0tZmc6ICNlOGVhZWU7IC0tbXV0ZWQ6ICM5YWExYWQ7IC0tZnJhbWU6ICMwNTA2MDg7IC0tZG9jazogIzFiMWUyNDsgLS1saW5lOiAjMmMzMTNhOwogICAgLS1hY2NlbnQ6ICNlMDg0NjM7IC0tYWNjZW50LWluazogIzFhMGYwYTsgLS1idWJibGU6ICMyNjJhMzI7IC0tYnViYmxlLWluazogI2VlZjBmMzsKICAgIC0tYmFyLWZvb2Q6ICNlM2FhNTU7IC0tYmFyLW1vb2Q6ICNlYTdkOTk7IGNvbG9yLXNjaGVtZTogZGFyazsKICB9Cn0KOnJvb3RbZGF0YS10aGVtZT0iZGFyayJdIHsKICAtLWJnOiAjMTAxMjE2OyAtLXNjcmVlbjogIzE4MWIyMTsgLS1zY3JlZW4tZG90OiAjMjYyYTMzOyAtLWRlc2s6ICMzYTMxMjk7IC0tZGVzay1lZGdlOiAjNGEzZjM0OwogIC0tZmc6ICNlOGVhZWU7IC0tbXV0ZWQ6ICM5YWExYWQ7IC0tZnJhbWU6ICMwNTA2MDg7IC0tZG9jazogIzFiMWUyNDsgLS1saW5lOiAjMmMzMTNhOwogIC0tYWNjZW50OiAjZTA4NDYzOyAtLWFjY2VudC1pbms6ICMxYTBmMGE7IC0tYnViYmxlOiAjMjYyYTMyOyAtLWJ1YmJsZS1pbms6ICNlZWYwZjM7CiAgLS1iYXItZm9vZDogI2UzYWE1NTsgLS1iYXItbW9vZDogI2VhN2Q5OTsgY29sb3Itc2NoZW1lOiBkYXJrOwp9Cmh0bWwsIGJvZHkgeyBoZWlnaHQ6IDEwMCU7IG1hcmdpbjogMDsgfQpodG1sIHsgcGFkZGluZy10b3A6IGVudihzYWZlLWFyZWEtaW5zZXQtdG9wLCAwcHgpOyBwYWRkaW5nLWJvdHRvbTogZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20sIDBweCk7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IH0KKiB7IC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7IH0KYm9keSB7IGJhY2tncm91bmQ6IHZhcigtLWJnKTsgY29sb3I6IHZhcigtLWZnKTsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtYm9keSk7IH0KLmFwcCB7CiAgaGVpZ2h0OiAxMDAlOyBib3gtc2l6aW5nOiBib3JkZXItYm94OwogIGRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtcm93czogMWZyIGF1dG87IGdhcDogMTJweDsKICBwYWRkaW5nLWlubGluZTogMTZweDsgcGFkZGluZy1ibG9jazogMTZweDsKICBtYXgtd2lkdGg6IDExMDBweDsgbWFyZ2luOiAwIGF1dG87Cn0KLm1vbml0b3IgewogIHBvc2l0aW9uOiByZWxhdGl2ZTsgbWluLWhlaWdodDogMjYwcHg7IGJvcmRlci1yYWRpdXM6IDE0cHg7IG92ZXJmbG93OiBoaWRkZW47CiAgYm9yZGVyOiA2cHggc29saWQgdmFyKC0tZnJhbWUpOyBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JlZW4pOwogIHRvdWNoLWFjdGlvbjogbm9uZTsgdXNlci1zZWxlY3Q6IG5vbmU7IC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7Cn0KY2FudmFzIHsgcG9zaXRpb246IGFic29sdXRlOyBpbnNldDogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgZGlzcGxheTogYmxvY2s7IGN1cnNvcjogcG9pbnRlcjsgfQouaGludCB7CiAgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDEwcHg7IGxlZnQ6IDEycHg7IHJpZ2h0OiAxMnB4OwogIGZvbnQtc2l6ZTogMTJweDsgY29sb3I6IHZhcigtLW11dGVkKTsgcG9pbnRlci1ldmVudHM6IG5vbmU7Cn0KLmJ1YmJsZSB7CiAgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyB0b3A6IDA7IG1heC13aWR0aDogMjIwcHg7CiAgYmFja2dyb3VuZDogdmFyKC0tYnViYmxlKTsgY29sb3I6IHZhcigtLWJ1YmJsZS1pbmspOwogIGZvbnQtc2l6ZTogMTRweDsgbGluZS1oZWlnaHQ6IDEuNDsgcGFkZGluZzogN3B4IDExcHg7CiAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tZnJhbWUpOyBib3JkZXItcmFkaXVzOiA0cHg7CiAgYm94LXNoYWRvdzogM3B4IDNweCAwIHZhcigtLWZyYW1lKTsKICBwb2ludGVyLWV2ZW50czogbm9uZTsgd2hpdGUtc3BhY2U6IG5vd3JhcDsKICB0cmFuc2l0aW9uOiBvcGFjaXR5IC4xNXM7Cn0KLmJ1YmJsZTo6YWZ0ZXIgewogIGNvbnRlbnQ6ICIiOyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IDUwJTsgYm90dG9tOiAtOHB4OyBtYXJnaW4tbGVmdDogLTZweDsKICB3aWR0aDogMTBweDsgaGVpZ2h0OiAxMHB4OyBiYWNrZ3JvdW5kOiB2YXIoLS1idWJibGUpOwogIGJvcmRlci1yaWdodDogMnB4IHNvbGlkIHZhcigtLWZyYW1lKTsgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLWZyYW1lKTsKICB0cmFuc2Zvcm06IHJvdGF0ZSg0NWRlZykgdHJhbnNsYXRlKC0ycHgsLTJweCk7Cn0KLmRvY2sgewogIGRpc3BsYXk6IGZsZXg7IGZsZXgtd3JhcDogd3JhcDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAxMnB4IDIwcHg7CiAgYmFja2dyb3VuZDogdmFyKC0tZG9jayk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWxpbmUpOyBib3JkZXItcmFkaXVzOiAxMnB4OwogIHBhZGRpbmc6IDEycHggMTRweDsKfQoubmFtZSB7IGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LXBpeGVsKTsgZm9udC1zaXplOiAxOHB4OyBsZXR0ZXItc3BhY2luZzogLjA0ZW07IH0KLm5hbWUgc21hbGwgeyBkaXNwbGF5OiBibG9jazsgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtYm9keSk7IGZvbnQtc2l6ZTogMTFweDsgY29sb3I6IHZhcigtLW11dGVkKTsgbGV0dGVyLXNwYWNpbmc6IDA7IH0KLnN0YXRzIHsgZGlzcGxheTogZ3JpZDsgZ2FwOiA2cHg7IGZsZXg6IDEgMSAyMDBweDsgbWluLXdpZHRoOiAwOyB9Ci5zdGF0IHsgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAzNHB4IDFmciAzMHB4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDhweDsgZm9udC1zaXplOiAxMnB4OyBjb2xvcjogdmFyKC0tbXV0ZWQpOyB9Ci5zdGF0IGIgeyBmb250LWZhbWlseTogdmFyKC0tZm9udC1waXhlbCk7IGZvbnQtd2VpZ2h0OiA0MDA7IGZvbnQtdmFyaWFudC1udW1lcmljOiB0YWJ1bGFyLW51bXM7IHRleHQtYWxpZ246IHJpZ2h0OyBjb2xvcjogdmFyKC0tZmcpOyB9Ci50cmFjayB7IGhlaWdodDogMTBweDsgYm9yZGVyOiAycHggc29saWQgdmFyKC0tZnJhbWUpOyBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JlZW4pOyB9Ci5maWxsIHsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogNTAlOyB0cmFuc2l0aW9uOiB3aWR0aCAuM3M7IH0KI2Zvb2RGaWxsIHsgYmFja2dyb3VuZDogdmFyKC0tYmFyLWZvb2QpOyB9CiNtb29kRmlsbCB7IGJhY2tncm91bmQ6IHZhcigtLWJhci1tb29kKTsgfQouYWN0aW9ucyB7IGRpc3BsYXk6IGZsZXg7IGZsZXgtd3JhcDogd3JhcDsgZ2FwOiA4cHg7IH0KYnV0dG9uIHsKICBmb250OiBpbmhlcml0OyBmb250LXNpemU6IDE0cHg7IGN1cnNvcjogcG9pbnRlcjsKICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JlZW4pOyBjb2xvcjogdmFyKC0tZmcpOwogIGJvcmRlcjogMnB4IHNvbGlkIHZhcigtLWZyYW1lKTsgYm9yZGVyLXJhZGl1czogNHB4OyBwYWRkaW5nOiA2cHggMTJweDsKICBib3gtc2hhZG93OiAycHggMnB4IDAgdmFyKC0tZnJhbWUpOwp9CmJ1dHRvbjphY3RpdmUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgycHgsMnB4KTsgYm94LXNoYWRvdzogbm9uZTsgfQpidXR0b24ucHJpbWFyeSB7IGJhY2tncm91bmQ6IHZhcigtLWFjY2VudCk7IGNvbG9yOiB2YXIoLS1hY2NlbnQtaW5rKTsgfQpidXR0b246Zm9jdXMtdmlzaWJsZSB7IG91dGxpbmU6IDNweCBzb2xpZCB2YXIoLS1hY2NlbnQpOyBvdXRsaW5lLW9mZnNldDogMnB4OyB9CkBtZWRpYSAobWF4LXdpZHRoOiA1MjBweCkgewogIC5oaW50IHsgZm9udC1zaXplOiAxMXB4OyB9CiAgYnV0dG9uIHsgcGFkZGluZzogNnB4IDEwcHg7IH0KfQo8L3N0eWxlPgo8L2hlYWQ+Cjxib2R5PgoKPGRpdiBjbGFzcz0iYXBwIj4KICA8ZGl2IGNsYXNzPSJtb25pdG9yIiBpZD0ibW9uaXRvciI+CiAgICA8Y2FudmFzIGlkPSJzdGFnZSIgYXJpYS1sYWJlbD0i5qGM5a6gIENsYXdkIOeahOWwj+ahjOmdoiI+PC9jYW52YXM+CiAgICA8ZGl2IGNsYXNzPSJoaW50Ij7ngrnlroPmkbjmkbggwrcg5oyJ5L2P5ouW6LW35p2lIMK3IOeCueepuueZveWkhOWPq+Wug+i/h+adpTwvZGl2PgogICAgPGRpdiBjbGFzcz0iYnViYmxlIiBpZD0iYnViYmxlIiBoaWRkZW4+PC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0iZG9jayI+CiAgICA8ZGl2IGNsYXNzPSJuYW1lIj5DTEFXRDxzbWFsbCBpZD0ic3RhdHVzIj7lj5HlkYbkuK08L3NtYWxsPjwvZGl2PgogICAgPGRpdiBjbGFzcz0ic3RhdHMiPgogICAgICA8ZGl2IGNsYXNzPSJzdGF0Ij7ppbHohbk8ZGl2IGNsYXNzPSJ0cmFjayI+PGRpdiBjbGFzcz0iZmlsbCIgaWQ9ImZvb2RGaWxsIj48L2Rpdj48L2Rpdj48YiBpZD0iZm9vZE51bSI+NTA8L2I+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InN0YXQiPuW/g+aDhTxkaXYgY2xhc3M9InRyYWNrIj48ZGl2IGNsYXNzPSJmaWxsIiBpZD0ibW9vZEZpbGwiPjwvZGl2PjwvZGl2PjxiIGlkPSJtb29kTnVtIj41MDwvYj48L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0iYWN0aW9ucyI+CiAgICAgIDxidXR0b24gY2xhc3M9InByaW1hcnkiIGlkPSJidG5GZWVkIj7mipXlloLppbzlubI8L2J1dHRvbj4KICAgICAgPGJ1dHRvbiBpZD0iYnRuUGV0Ij7mkbjmkbjlpLQ8L2J1dHRvbj4KICAgICAgPGJ1dHRvbiBpZD0iYnRuSnVtcCI+6Lez5LiA5LiLPC9idXR0b24+CiAgICAgIDxidXR0b24gaWQ9ImJ0blNsZWVwIj7lk4TnnaE8L2J1dHRvbj4KICAgIDwvZGl2PgogIDwvZGl2Pgo8L2Rpdj4KCjxzY3JpcHQ+CigoKSA9PiB7CiAgY29uc3QgbW9uaXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25pdG9yJyk7CiAgY29uc3QgQyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFnZScpOwogIGNvbnN0IGN0eCA9IEMuZ2V0Q29udGV4dCgnMmQnKTsKICBjb25zdCBidWJibGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnViYmxlJyk7CiAgY29uc3Qgc3RhdHVzRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhdHVzJyk7CiAgY29uc3QgVSA9IDY7IC8vIG9uZSBzcHJpdGUgcGl4ZWwgaW4gQ1NTIHB4CiAgbGV0IFcgPSAzMDAsIEggPSAzMDAsIGZsb29yID0gMjcwOwogIGxldCBjb2xvcnMgPSB7fTsKCiAgZnVuY3Rpb24gcmVhZENvbG9ycygpIHsKICAgIGNvbnN0IHMgPSBnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7CiAgICBjb25zdCBnID0gbiA9PiBzLmdldFByb3BlcnR5VmFsdWUobikudHJpbSgpOwogICAgY29sb3JzID0geyBkb3Q6IGcoJy0tc2NyZWVuLWRvdCcpLCBkZXNrOiBnKCctLWRlc2snKSwgZWRnZTogZygnLS1kZXNrLWVkZ2UnKSwgbXV0ZWQ6IGcoJy0tbXV0ZWQnKSB9OwogIH0KICBmdW5jdGlvbiByZXNpemUoKSB7CiAgICBjb25zdCByID0gbW9uaXRvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTsKICAgIGNvbnN0IGRwciA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7CiAgICBXID0gci53aWR0aCAtIDEyOyBIID0gci5oZWlnaHQgLSAxMjsgLy8gbWludXMgYm9yZGVyCiAgICBDLndpZHRoID0gTWF0aC5yb3VuZChXICogZHByKTsgQy5oZWlnaHQgPSBNYXRoLnJvdW5kKEggKiBkcHIpOwogICAgY3R4LnNldFRyYW5zZm9ybShkcHIsIDAsIDAsIGRwciwgMCwgMCk7CiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7CiAgICBmbG9vciA9IEggLSAyNjsKICAgIHBldC54ID0gY2xhbXAocGV0LngsIDYwLCBXIC0gNjApOwogICAgaWYgKHBldC5zdGF0ZSAhPT0gJ2hlbGQnICYmIHBldC5zdGF0ZSAhPT0gJ2ZhbGwnICYmIHBldC5zdGF0ZSAhPT0gJ2p1bXAnKSBwZXQueSA9IGZsb29yOwogIH0KICBjb25zdCBjbGFtcCA9ICh2LCBhLCBiKSA9PiBNYXRoLm1heChhLCBNYXRoLm1pbihiLCB2KSk7CiAgY29uc3QgcmFuZCA9IChhLCBiKSA9PiBhICsgTWF0aC5yYW5kb20oKSAqIChiIC0gYSk7CiAgY29uc3QgcGljayA9IGFyciA9PiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldOwoKICAvLyAtLS0tIHNhdmVkIHN0YXRzIC0tLS0KICAvLyBTY3JpcHRhYmxlIHJlcGxhY2VzIHRoZSBtYXJrZXIgYmVsb3cgd2l0aCB7Zm9vZCwgbW9vZCwgYWN0aW9uLCBzbGVlcHl9CiAgY29uc3QgSU5JVCA9IC8qQ0xBV0RfSU5JVCovbnVsbCB8fCB7fTsKICBjb25zdCBzdGF0cyA9IHsgZm9vZDogSU5JVC5mb29kID8/IDcwLCBtb29kOiBJTklULm1vb2QgPz8gNzAgfTsKICBsZXQgbGFzdEFjdGlvbiA9IG51bGw7CiAgd2luZG93LmNsYXdkU3RhdHMgPSAoKSA9PiBKU09OLnN0cmluZ2lmeSh7IGZvb2Q6IHN0YXRzLmZvb2QsIG1vb2Q6IHN0YXRzLm1vb2QsIGxhc3RBY3Rpb24gfSk7CgogIC8vIC0tLS0gcGV0IC0tLS0KICBjb25zdCBwZXQgPSB7CiAgICB4OiAyMDAsIHk6IDI3MCwgdnk6IDAsIGRpcjogMSwgc3RhdGU6ICdpZGxlJywgdDogMCwgbmV4dDogMiwKICAgIHRhcmdldDogbnVsbCwgc3F1YXNoOiAwLCBibGluazogMCwgbmV4dEJsaW5rOiAyLCBpZGxlRm9yOiAwLCB3YWxrUGhhc2U6IDAsIGZvb2RSZWY6IG51bGwKICB9OwogIGNvbnN0IGZvb2RzID0gW107CiAgY29uc3QgcGFydHMgPSBbXTsKCiAgY29uc3QgU1RBVFVTID0geyBpZGxlOiAn5Y+R5ZGG5LitJywgd2FsazogJ+a6nOi+vuS4rScsIGhlbGQ6ICfooqvmi47otbfmnaXkuoYnLCBmYWxsOiAn5o6J5LiL5Y675LqGJywganVtcDogJ+i5pu+8gScsIGhhcHB5OiAn6LaF5byA5b+DJywgZWF0OiAn5ZCD5Lic6KW/5LitJywgc2xlZXA6ICfnnaHnnYDkuoYgenp6JywgZGl6enk6ICfmnInngrnmmZUnIH07CiAgZnVuY3Rpb24gc2V0U3RhdGUocywgZHVyKSB7CiAgICBwZXQuc3RhdGUgPSBzOyBwZXQudCA9IDA7IHBldC5uZXh0ID0gZHVyID8/IDA7CiAgICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IFNUQVRVU1tzXSB8fCAnJzsKICB9CgogIC8vIC0tLS0gc3BlZWNoIC0tLS0KICBsZXQgYnViYmxlVGltZXIgPSAwOwogIGZ1bmN0aW9uIHNheSh0ZXh0LCBzZWNzID0gMi40KSB7CiAgICBidWJibGUudGV4dENvbnRlbnQgPSB0ZXh0OyBidWJibGUuaGlkZGVuID0gZmFsc2U7IGJ1YmJsZVRpbWVyID0gc2VjczsKICB9CiAgY29uc3QgTElORVMgPSB7CiAgICB0YXA6IFsn5Zi/5Zi/772eJywgJ+aRuOaRuOWktO+8gScsICflho3mkbjkuIDkuIvlmJsnLCAn5Zev77yf5Y+r5oiR5ZCXJywgJyjlvIDlv4PlnLDmjKXmiYspJywgJ+S7iuWkqeS5n+imgeWKoOayueWGmeS7o+eggSddLAogICAgaWRsZTogWydnaXQgcHVzaCDkuoblkJfvvJ8nLCAn6KaB5LiN6KaB5Zad5Y+j5rC0JywgJ+aIkeWcqOeci+edgOS9oOWGmeS7o+eggeWTpicsICfmtYvor5Xpg73ov4fkuoblkJcnLCAn5LyR5oGv5LiA5LiL55y8552b5ZCnJywgJ+i/meS4qiBidWcg5oiR5aW95YOP6KeB6L+H4oCmJywgJ+iusOW+l+aPkOS6pOS7o+eggeWTpiddLAogICAgaHVuZ3J5OiBbJ+iCmuWtkOWSleWSleWPq+KApicsICfmnInppbzlubLlkJfigKYnLCAn6aW/6aW/J10sCiAgICBjb21lOiBbJ+adpeS6huadpeS6hicsICfov5nlsLHmnaXvvIEnLCAn5Yay77yBJ10sCiAgICBsYW5kOiBbJ+aZleKApicsICfnnLzlhpLph5HmmJ/igKYnLCAn5LiL5qyh6L2754K55pS+5ZibJ10sCiAgICBoZWxkOiBbJ+WTh+WViuWViuKAlOKAlCcsICfmlL7miJHkuIvmnaXvvIEnLCAn5aW96auY77yBJ10sCiAgICB3YWtlOiBbJ+WUlOKApuaIkemGkuedgOWRoicsICfmsqHnnaHmsqHnnaEnLCAn5Yia5omN5Zyo5oCd6ICDJ10sCiAgICBlYXQ6IFsn5aW95ZCD77yBJywgJ+WavOWavOWavCcsICflho3mnaXkuIDlnZfvvIEnXQogIH07CgogIC8vIC0tLS0gZHJhd2luZyAtLS0tCiAgZnVuY3Rpb24gcHgoeCwgeSwgdywgaCwgYykgeyBjdHguZmlsbFN0eWxlID0gYzsgY3R4LmZpbGxSZWN0KE1hdGgucm91bmQoeCksIE1hdGgucm91bmQoeSksIE1hdGgucm91bmQodyksIE1hdGgucm91bmQoaCkpOyB9CgogIGZ1bmN0aW9uIGRyYXdQZXQoKSB7CiAgICBjb25zdCBwID0gcGV0LCBzID0gcC5zdGF0ZTsKICAgIGNvbnN0IHdhbGtpbmcgPSBzID09PSAnd2Fsayc7CiAgICBjb25zdCBzdGVwID0gTWF0aC5mbG9vcihwLndhbGtQaGFzZSkgJSAyOwogICAgY29uc3QgYm9iID0gd2Fsa2luZyA/IChzdGVwID8gLVUgKiAwLjUgOiAwKSA6IChzID09PSAnc2xlZXAnID8gTWF0aC5zaW4ocC50ICogMikgKiAxLjUgOiAwKTsKICAgIGNvbnN0IEJPRFkgPSAnI2Q5Nzc1NycsIERBUksgPSAnI2Q5Nzc1NycsIEVZRSA9ICcjMWIxNDExJywgTEVHID0gJyNjNDY2NGEnOwoKICAgIC8vIHNoYWRvdwogICAgY29uc3QgYWlyID0gTWF0aC5tYXgoMCwgZmxvb3IgLSBwLnkpOwogICAgY29uc3Qgc2ggPSBjbGFtcCgxIC0gYWlyIC8gMzAwLCAwLjMsIDEpOwogICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLDAuMTYpJzsKICAgIGN0eC5iZWdpblBhdGgoKTsgY3R4LmVsbGlwc2UocC54LCBmbG9vciArIDIsIDcgKiBVICogc2gsIDEuMiAqIFUgKiBzaCwgMCwgMCwgTWF0aC5QSSAqIDIpOyBjdHguZmlsbCgpOwoKICAgIGN0eC5zYXZlKCk7CiAgICBjdHgudHJhbnNsYXRlKHAueCwgcC55KTsKICAgIGNvbnN0IHNxID0gcC5zcXVhc2g7CiAgICBjdHguc2NhbGUoMSArIHNxICogMC42LCAxIC0gc3EpOwogICAgaWYgKHMgPT09ICdoZWxkJykgY3R4LnJvdGF0ZShNYXRoLnNpbihwLnQgKiA4KSAqIDAuMTIpOwoKICAgIC8vIGxlZ3MKICAgIGNvbnN0IGxlZ0NvbHMgPSBbLTUsIC0zLCAyLCA0XTsKICAgIGxlZ0NvbHMuZm9yRWFjaCgoYywgaSkgPT4gewogICAgICBsZXQgaCA9IDIgKiBVOwogICAgICBpZiAod2Fsa2luZyAmJiAoaSAlIDIpID09PSBzdGVwKSBoID0gVTsKICAgICAgaWYgKHMgPT09ICdoZWxkJykgaCA9IDIgKiBVICsgKGkgJSAyID8gMiA6IDApOwogICAgICBpZiAocyA9PT0gJ3NsZWVwJykgaCA9IFUgKiAwLjg7CiAgICAgIHB4KGMgKiBVLCAtaCwgVSwgaCwgTEVHKTsKICAgIH0pOwogICAgY29uc3QgbGVnSCA9IHMgPT09ICdzbGVlcCcgPyBVICogMC44IDogMiAqIFU7CiAgICBjb25zdCB0b3AgPSAtbGVnSCAtIDcgKiBVICsgYm9iOwoKICAgIC8vIGJvZHkKICAgIHB4KC02ICogVSwgdG9wLCAxMiAqIFUsIDcgKiBVLCBCT0RZKTsKICAgIC8vIGFybXMKICAgIGxldCBhcm1ZID0gdG9wICsgMyAqIFU7CiAgICBsZXQgbEEgPSAwLCByQSA9IDA7CiAgICBpZiAocyA9PT0gJ2hhcHB5JyB8fCBzID09PSAnaGVsZCcpIHsgbEEgPSBNYXRoLnNpbihwLnQgKiAxOCkgPiAwID8gLVUgOiAwOyByQSA9IE1hdGguc2luKHAudCAqIDE4KSA+IDAgPyAwIDogLVU7IH0KICAgIGlmIChzID09PSAnZWF0JykgeyBsQSA9IHJBID0gTWF0aC5zaW4ocC50ICogMTQpID4gMCA/IC1VIDogMDsgfQogICAgcHgoLTcgKiBVLCBhcm1ZICsgbEEsIFUsIDIgKiBVLCBEQVJLKTsKICAgIHB4KDYgKiBVLCBhcm1ZICsgckEsIFUsIDIgKiBVLCBEQVJLKTsKCiAgICAvLyBleWVzCiAgICBjb25zdCBsb29rID0gKHdhbGtpbmcgfHwgcyA9PT0gJ2VhdCcpID8gcC5kaXIgOiAwOwogICAgY29uc3QgZXllcyA9IFstNCArIGxvb2ssIDMgKyBsb29rXTsKICAgIGNvbnN0IGV5ZVRvcCA9IHRvcCArIDIgKiBVOwogICAgY29uc3QgYmxpbmtpbmcgPSBwLmJsaW5rID4gMDsKICAgIGV5ZXMuZm9yRWFjaCgoYywgaSkgPT4gewogICAgICBjb25zdCBleCA9IGMgKiBVOwogICAgICBpZiAocyA9PT0gJ3NsZWVwJykgewogICAgICAgIHB4KGV4IC0gVSAqIDAuMjUsIGV5ZVRvcCArIDEuNSAqIFUsIFUgKiAxLjUsIFUgKiAwLjUsIEVZRSk7CiAgICAgIH0gZWxzZSBpZiAocyA9PT0gJ2hhcHB5JykgewogICAgICAgIHB4KGV4IC0gVSAqIDAuNSwgZXllVG9wICsgVSwgVSAqIDAuNSwgVSAqIDAuNSwgRVlFKTsKICAgICAgICBweChleCwgZXllVG9wICsgVSAqIDAuNSwgVSwgVSAqIDAuNSwgRVlFKTsKICAgICAgICBweChleCArIFUsIGV5ZVRvcCArIFUsIFUgKiAwLjUsIFUgKiAwLjUsIEVZRSk7CiAgICAgIH0gZWxzZSBpZiAocyA9PT0gJ2Rpenp5JykgewogICAgICAgIGNvbnN0IHVwID0gKE1hdGguZmxvb3IocC50ICogNikgKyBpKSAlIDI7CiAgICAgICAgcHgoZXgsIGV5ZVRvcCArICh1cCA/IDAgOiBVKSwgVSwgVSwgRVlFKTsKICAgICAgfSBlbHNlIGlmIChibGlua2luZykgewogICAgICAgIHB4KGV4LCBleWVUb3AgKyAxLjI1ICogVSwgVSwgVSAqIDAuNSwgRVlFKTsKICAgICAgfSBlbHNlIHsKICAgICAgICBweChleCwgZXllVG9wLCBVLCAyICogVSwgRVlFKTsKICAgICAgfQogICAgfSk7CiAgICAvLyBtb3V0aCB3aGlsZSBlYXRpbmcKICAgIGlmIChzID09PSAnZWF0JyAmJiBNYXRoLnNpbihwLnQgKiAxNCkgPiAwKSBweCgtVSwgdG9wICsgNSAqIFUsIDIgKiBVLCBVLCBFWUUpOwogICAgaWYgKHMgPT09ICdoZWxkJykgcHgoLVUgKiAwLjUsIHRvcCArIDUgKiBVLCBVLCBVLCBFWUUpOwoKICAgIGN0eC5yZXN0b3JlKCk7CiAgfQoKICBmdW5jdGlvbiBkcmF3Q29va2llKGYpIHsKICAgIGNvbnN0IHUgPSAzLCB4ID0gZi54IC0gMyAqIHUsIHkgPSBmLnkgLSA2ICogdTsKICAgIGNvbnN0IEMxID0gJyNjOThhNGInLCBDMiA9ICcjNWEzNzIwJzsKICAgIHB4KHggKyB1LCB5LCA0ICogdSwgNiAqIHUsIEMxKTsKICAgIHB4KHgsIHkgKyB1LCA2ICogdSwgNCAqIHUsIEMxKTsKICAgIHB4KHggKyB1ICogMS41LCB5ICsgdSAqIDEuNSwgdSwgdSwgQzIpOwogICAgcHgoeCArIHUgKiAzLjUsIHkgKyB1ICogMi41LCB1LCB1LCBDMik7CiAgICBweCh4ICsgdSAqIDIsIHkgKyB1ICogNCwgdSwgdSwgQzIpOwogIH0KCiAgZnVuY3Rpb24gZHJhd0hlYXJ0KHgsIHksIGEsIHNpemUpIHsKICAgIGN0eC5nbG9iYWxBbHBoYSA9IGE7CiAgICBjb25zdCB1ID0gc2l6ZSwgYyA9ICcjZTQ2ZjhmJzsKICAgIHB4KHggLSAyICogdSwgeSwgdSAqIDEuNSwgdSwgYyk7IHB4KHggKyAwLjUgKiB1LCB5LCB1ICogMS41LCB1LCBjKTsKICAgIHB4KHggLSAyLjUgKiB1LCB5ICsgdSwgNSAqIHUsIHUsIGMpOwogICAgcHgoeCAtIDIgKiB1LCB5ICsgMiAqIHUsIDQgKiB1LCB1LCBjKTsKICAgIHB4KHggLSB1LCB5ICsgMyAqIHUsIDIgKiB1LCB1LCBjKTsKICAgIGN0eC5nbG9iYWxBbHBoYSA9IDE7CiAgfQoKICBmdW5jdGlvbiBkcmF3U2NlbmUoKSB7CiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIFcsIEgpOwogICAgLy8gZG90dGVkIHdhbGxwYXBlcgogICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9ycy5kb3Q7CiAgICBmb3IgKGxldCB5ID0gMTg7IHkgPCBmbG9vciAtIDEwOyB5ICs9IDIyKSBmb3IgKGxldCB4ID0gMTQ7IHggPCBXOyB4ICs9IDIyKSBjdHguZmlsbFJlY3QoeCwgeSwgMiwgMik7CiAgICAvLyBkZXNrCiAgICBweCgwLCBmbG9vciwgVywgSCAtIGZsb29yLCBjb2xvcnMuZGVzayk7CiAgICBweCgwLCBmbG9vciwgVywgMywgY29sb3JzLmVkZ2UpOwoKICAgIGZvb2RzLmZvckVhY2goZHJhd0Nvb2tpZSk7CiAgICBkcmF3UGV0KCk7CgogICAgcGFydHMuZm9yRWFjaChxID0+IHsKICAgICAgY29uc3QgYSA9IGNsYW1wKDEgLSBxLnQgLyBxLmxpZmUsIDAsIDEpOwogICAgICBpZiAocS5raW5kID09PSAnaGVhcnQnKSBkcmF3SGVhcnQocS54LCBxLnksIGEsIDIuNSk7CiAgICAgIGVsc2UgaWYgKHEua2luZCA9PT0gJ3onKSB7CiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gYTsgY3R4LmZpbGxTdHlsZSA9IGNvbG9ycy5tdXRlZDsKICAgICAgICBjdHguZm9udCA9IGAke3Euc2l6ZX1weCBTaWxrc2NyZWVuLCBtb25vc3BhY2VgOyBjdHguZmlsbFRleHQoJ3onLCBxLngsIHEueSk7CiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMTsKICAgICAgfSBlbHNlIGlmIChxLmtpbmQgPT09ICdzdGFyJykgewogICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IGE7IHB4KHEueCAtIDIsIHEueSAtIDIsIDQsIDQsICcjZTBhMjRhJyk7IGN0eC5nbG9iYWxBbHBoYSA9IDE7CiAgICAgIH0KICAgIH0pOwogIH0KCiAgLy8gLS0tLSBiZWhhdmlvdXIgLS0tLQogIGZ1bmN0aW9uIGhlYXJ0cyhuID0gNCkgewogICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHBhcnRzLnB1c2goeyBraW5kOiAnaGVhcnQnLCB4OiBwZXQueCArIHJhbmQoLTMwLCAzMCksIHk6IHBldC55IC0gMTAgKiBVICsgcmFuZCgtMTAsIDEwKSwgdnk6IHJhbmQoLTUwLCAtMzApLCB2eDogcmFuZCgtMTAsIDEwKSwgdDogMCwgbGlmZTogcmFuZCgxLCAxLjYpIH0pOwogIH0KICBmdW5jdGlvbiBzdGFycygpIHsKICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7IGNvbnN0IGEgPSBpIC8gNiAqIE1hdGguUEkgKiAyOyBwYXJ0cy5wdXNoKHsga2luZDogJ3N0YXInLCB4OiBwZXQueCArIE1hdGguY29zKGEpICogNDAsIHk6IHBldC55IC0gOSAqIFUgKyBNYXRoLnNpbihhKSAqIDEyLCB2eDogLU1hdGguc2luKGEpICogNDAsIHZ5OiBNYXRoLmNvcyhhKSAqIDEyLCB0OiAwLCBsaWZlOiAxLjYgfSk7IH0KICB9CiAgZnVuY3Rpb24gdG91Y2goKSB7IHBldC5pZGxlRm9yID0gMDsgfQoKICBmdW5jdGlvbiBwZXRIZWFkKCkgewogICAgdG91Y2goKTsKICAgIGlmIChwZXQuc3RhdGUgPT09ICdzbGVlcCcpIHsgc2V0U3RhdGUoJ2lkbGUnLCByYW5kKDEuNSwgMykpOyBzYXkocGljayhMSU5FUy53YWtlKSk7IHJldHVybjsgfQogICAgaWYgKFsnaGVsZCcsICdmYWxsJywgJ2p1bXAnXS5pbmNsdWRlcyhwZXQuc3RhdGUpKSByZXR1cm47CiAgICBzdGF0cy5tb29kID0gY2xhbXAoc3RhdHMubW9vZCArIDgsIDAsIDEwMCk7IGxhc3RBY3Rpb24gPSAncGV0JzsKICAgIHNldFN0YXRlKCdoYXBweScsIDEuMyk7IGhlYXJ0cygpOyBzYXkocGljayhMSU5FUy50YXApKTsKICB9CiAgZnVuY3Rpb24gZmVlZCgpIHsKICAgIHRvdWNoKCk7CiAgICBmb29kcy5wdXNoKHsgeDogcmFuZCg1MCwgVyAtIDUwKSwgeTogLTEwLCB2eTogMCwgbGFuZGVkOiBmYWxzZSB9KTsKICAgIGlmIChwZXQuc3RhdGUgPT09ICdzbGVlcCcpIHsgc2V0U3RhdGUoJ2lkbGUnLCAwLjUpOyBzYXkoJ+KApumXu+WIsOmlvOW5suWRs+S6hu+8gScpOyB9CiAgfQogIGZ1bmN0aW9uIGp1bXAoKSB7CiAgICB0b3VjaCgpOwogICAgaWYgKFsnaGVsZCcsICdmYWxsJywgJ2p1bXAnXS5pbmNsdWRlcyhwZXQuc3RhdGUpKSByZXR1cm47CiAgICBwZXQudnkgPSAtNTYwOyBwZXQuc3F1YXNoID0gLTAuMTU7IHNldFN0YXRlKCdqdW1wJyk7CiAgfQogIGZ1bmN0aW9uIHNsZWVwKCkgewogICAgdG91Y2goKTsKICAgIGlmIChwZXQuc3RhdGUgPT09ICdzbGVlcCcpIHsgc2V0U3RhdGUoJ2lkbGUnLCAyKTsgc2F5KHBpY2soTElORVMud2FrZSkpOyByZXR1cm47IH0KICAgIGlmIChbJ2hlbGQnLCAnZmFsbCcsICdqdW1wJ10uaW5jbHVkZXMocGV0LnN0YXRlKSkgcmV0dXJuOwogICAgcGV0LnkgPSBmbG9vcjsgc2V0U3RhdGUoJ3NsZWVwJyk7IHNheSgn5pma5a6J4oCmJywgMS41KTsKICB9CgogIGZ1bmN0aW9uIG5lYXJlc3RGb29kKCkgewogICAgbGV0IGJlc3QgPSBudWxsLCBkID0gSW5maW5pdHk7CiAgICBmb29kcy5mb3JFYWNoKGYgPT4geyBpZiAoZi5sYW5kZWQgJiYgTWF0aC5hYnMoZi54IC0gcGV0LngpIDwgZCkgeyBkID0gTWF0aC5hYnMoZi54IC0gcGV0LngpOyBiZXN0ID0gZjsgfSB9KTsKICAgIHJldHVybiBiZXN0OwogIH0KCiAgZnVuY3Rpb24gdXBkYXRlKGR0KSB7CiAgICBjb25zdCBwID0gcGV0OyBwLnQgKz0gZHQ7IHAuaWRsZUZvciArPSBkdDsKICAgIHAuc3F1YXNoICo9IE1hdGgucG93KDAuMDAwNSwgZHQpOwogICAgaWYgKE1hdGguYWJzKHAuc3F1YXNoKSA8IDAuMDA1KSBwLnNxdWFzaCA9IDA7CgogICAgLy8gYmxpbmsKICAgIHAubmV4dEJsaW5rIC09IGR0OyBpZiAocC5ibGluayA+IDApIHAuYmxpbmsgLT0gZHQ7CiAgICBpZiAocC5uZXh0QmxpbmsgPD0gMCkgeyBwLmJsaW5rID0gMC4xMjsgcC5uZXh0QmxpbmsgPSByYW5kKDIsIDUpOyB9CgogICAgLy8gZm9vZCBwaHlzaWNzCiAgICBmb29kcy5mb3JFYWNoKGYgPT4gewogICAgICBpZiAoZi5sYW5kZWQpIHJldHVybjsKICAgICAgZi52eSArPSAxNDAwICogZHQ7IGYueSArPSBmLnZ5ICogZHQ7CiAgICAgIGlmIChmLnkgPj0gZmxvb3IpIHsgZi55ID0gZmxvb3I7IGYubGFuZGVkID0gdHJ1ZTsgfQogICAgfSk7CgogICAgY29uc3QgYnVzeSA9IFsnaGVsZCcsICdmYWxsJywgJ2p1bXAnLCAnZWF0JywgJ3NsZWVwJ10uaW5jbHVkZXMocC5zdGF0ZSk7CiAgICBpZiAoIWJ1c3kgJiYgcC5zdGF0ZSAhPT0gJ2Rpenp5JykgewogICAgICBjb25zdCBmID0gbmVhcmVzdEZvb2QoKTsKICAgICAgaWYgKGYpIHsKICAgICAgICBpZiAoTWF0aC5hYnMoZi54IC0gcC54KSA8IDE0KSB7IHAuZm9vZFJlZiA9IGY7IHNldFN0YXRlKCdlYXQnLCAxLjQpOyBzYXkocGljayhMSU5FUy5lYXQpLCAxLjQpOyB9CiAgICAgICAgZWxzZSBpZiAocC5zdGF0ZSAhPT0gJ3dhbGsnIHx8IHAudGFyZ2V0ICE9PSBmLngpIHsgaWYgKHAuc3RhdGUgIT09ICd3YWxrJykgc2F5KCflvIDppa3llabvvIEnLCAxLjIpOyBwLnRhcmdldCA9IGYueDsgc2V0U3RhdGUoJ3dhbGsnKTsgfQogICAgICB9CiAgICB9CgogICAgc3dpdGNoIChwLnN0YXRlKSB7CiAgICAgIGNhc2UgJ2lkbGUnOgogICAgICAgIGlmIChwLnQgPiBwLm5leHQpIHsKICAgICAgICAgIGlmIChwLmlkbGVGb3IgPiAyNSkgeyBzZXRTdGF0ZSgnc2xlZXAnKTsgYnJlYWs7IH0KICAgICAgICAgIGNvbnN0IHIgPSBNYXRoLnJhbmRvbSgpOwogICAgICAgICAgaWYgKHIgPCAwLjU1KSB7IHAudGFyZ2V0ID0gcmFuZCg2MCwgVyAtIDYwKTsgc2V0U3RhdGUoJ3dhbGsnKTsgfQogICAgICAgICAgZWxzZSBpZiAociA8IDAuNzUpIHsgc2F5KHN0YXRzLmZvb2QgPCAzNSA/IHBpY2soTElORVMuaHVuZ3J5KSA6IHBpY2soTElORVMuaWRsZSksIDMpOyBzZXRTdGF0ZSgnaWRsZScsIHJhbmQoMywgNikpOyB9CiAgICAgICAgICBlbHNlIHNldFN0YXRlKCdpZGxlJywgcmFuZCgyLCA0KSk7CiAgICAgICAgfQogICAgICAgIGJyZWFrOwogICAgICBjYXNlICd3YWxrJzogewogICAgICAgIGNvbnN0IGR4ID0gcC50YXJnZXQgLSBwLng7CiAgICAgICAgcC5kaXIgPSBNYXRoLnNpZ24oZHgpIHx8IHAuZGlyOwogICAgICAgIGNvbnN0IHNwID0gNzA7CiAgICAgICAgcC53YWxrUGhhc2UgKz0gZHQgKiA3OwogICAgICAgIGlmIChNYXRoLmFicyhkeCkgPD0gc3AgKiBkdCkgeyBwLnggPSBwLnRhcmdldDsgc2V0U3RhdGUoJ2lkbGUnLCByYW5kKDEuNSwgNCkpOyB9CiAgICAgICAgZWxzZSBwLnggKz0gcC5kaXIgKiBzcCAqIGR0OwogICAgICAgIGJyZWFrOwogICAgICB9CiAgICAgIGNhc2UgJ2ZhbGwnOiBjYXNlICdqdW1wJzoKICAgICAgICBwLnZ5ICs9IDE2MDAgKiBkdDsgcC55ICs9IHAudnkgKiBkdDsKICAgICAgICBpZiAocC55ID49IGZsb29yKSB7CiAgICAgICAgICBjb25zdCBoYXJkID0gcC52eSA+IDkwMDsKICAgICAgICAgIHAueSA9IGZsb29yOyBwLnNxdWFzaCA9IGNsYW1wKHAudnkgLyAyNTAwLCAwLjA4LCAwLjM1KTsgcC52eSA9IDA7CiAgICAgICAgICBpZiAoaGFyZCkgeyBzZXRTdGF0ZSgnZGl6enknLCAxLjgpOyBzdGFycygpOyBzYXkocGljayhMSU5FUy5sYW5kKSwgMS44KTsgfQogICAgICAgICAgZWxzZSBzZXRTdGF0ZSgnaWRsZScsIHJhbmQoMSwgMi41KSk7CiAgICAgICAgfQogICAgICAgIGJyZWFrOwogICAgICBjYXNlICdoYXBweSc6CiAgICAgICAgcC55ID0gZmxvb3IgLSBNYXRoLmFicyhNYXRoLnNpbihwLnQgKiA5KSkgKiA4OwogICAgICAgIGlmIChwLnQgPiBwLm5leHQpIHsgcC55ID0gZmxvb3I7IHNldFN0YXRlKCdpZGxlJywgcmFuZCgxLjUsIDMpKTsgfQogICAgICAgIGJyZWFrOwogICAgICBjYXNlICdlYXQnOgogICAgICAgIGlmIChwLnQgPiBwLm5leHQpIHsKICAgICAgICAgIGNvbnN0IGkgPSBmb29kcy5pbmRleE9mKHAuZm9vZFJlZik7IGlmIChpID49IDApIGZvb2RzLnNwbGljZShpLCAxKTsKICAgICAgICAgIHN0YXRzLmZvb2QgPSBjbGFtcChzdGF0cy5mb29kICsgMjAsIDAsIDEwMCk7IHN0YXRzLm1vb2QgPSBjbGFtcChzdGF0cy5tb29kICsgNCwgMCwgMTAwKTsgbGFzdEFjdGlvbiA9ICdlYXQnOwogICAgICAgICAgaGVhcnRzKDIpOyBzZXRTdGF0ZSgnaWRsZScsIHJhbmQoMSwgMikpOwogICAgICAgIH0KICAgICAgICBicmVhazsKICAgICAgY2FzZSAnZGl6enknOgogICAgICAgIGlmIChwLnQgPiBwLm5leHQpIHNldFN0YXRlKCdpZGxlJywgcmFuZCgxLCAyKSk7CiAgICAgICAgYnJlYWs7CiAgICAgIGNhc2UgJ3NsZWVwJzoKICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IGR0ICogMC45KSBwYXJ0cy5wdXNoKHsga2luZDogJ3onLCB4OiBwLnggKyAzMCArIHJhbmQoMCwgMTApLCB5OiBwLnkgLSA5ICogVSwgdng6IHJhbmQoOCwgMTgpLCB2eTogLTIyLCB0OiAwLCBsaWZlOiAyLjIsIHNpemU6IE1hdGgucm91bmQocmFuZCgxMSwgMTcpKSB9KTsKICAgICAgICBicmVhazsKICAgIH0KCiAgICAvLyBzdGF0cyBkZWNheQogICAgc3RhdHMuZm9vZCA9IGNsYW1wKHN0YXRzLmZvb2QgLSBkdCAqIChwLnN0YXRlID09PSAnc2xlZXAnID8gMC4wMTUgOiAwLjAzNSksIDAsIDEwMCk7CiAgICBzdGF0cy5tb29kID0gY2xhbXAoc3RhdHMubW9vZCAtIGR0ICogKHAuc3RhdGUgPT09ICdzbGVlcCcgPyAwLjAwNSA6IDAuMDI1KSwgMCwgMTAwKTsKCiAgICAvLyBwYXJ0aWNsZXMKICAgIGZvciAobGV0IGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgewogICAgICBjb25zdCBxID0gcGFydHNbaV07IHEudCArPSBkdDsgcS54ICs9IHEudnggKiBkdDsgcS55ICs9IHEudnkgKiBkdDsKICAgICAgaWYgKHEudCA+IHEubGlmZSkgcGFydHMuc3BsaWNlKGksIDEpOwogICAgfQoKICAgIC8vIGJ1YmJsZQogICAgaWYgKGJ1YmJsZVRpbWVyID4gMCkgewogICAgICBidWJibGVUaW1lciAtPSBkdDsKICAgICAgaWYgKGJ1YmJsZVRpbWVyIDw9IDApIGJ1YmJsZS5oaWRkZW4gPSB0cnVlOwogICAgICBlbHNlIHsKICAgICAgICBjb25zdCBidyA9IGJ1YmJsZS5vZmZzZXRXaWR0aCwgYmggPSBidWJibGUub2Zmc2V0SGVpZ2h0OwogICAgICAgIGNvbnN0IGxlZnQgPSBjbGFtcChwLnggLSBidyAvIDIsIDYsIFcgLSBidyAtIDYpOwogICAgICAgIGNvbnN0IHRvcCA9IE1hdGgubWF4KDYsIHAueSAtIDExICogVSAtIGJoIC0gMTApOwogICAgICAgIGJ1YmJsZS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7bGVmdH1weCwgJHt0b3B9cHgpYDsKICAgICAgfQogICAgfQogIH0KCiAgLy8gLS0tLSBVSSAtLS0tCiAgY29uc3QgZm9vZEZpbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9vZEZpbGwnKSwgbW9vZEZpbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9vZEZpbGwnKTsKICBjb25zdCBmb29kTnVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvb2ROdW0nKSwgbW9vZE51bSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb29kTnVtJyk7CiAgZnVuY3Rpb24gcmVuZGVyU3RhdHMoKSB7CiAgICBmb29kRmlsbC5zdHlsZS53aWR0aCA9IHN0YXRzLmZvb2QgKyAnJSc7IG1vb2RGaWxsLnN0eWxlLndpZHRoID0gc3RhdHMubW9vZCArICclJzsKICAgIGZvb2ROdW0udGV4dENvbnRlbnQgPSBNYXRoLnJvdW5kKHN0YXRzLmZvb2QpOyBtb29kTnVtLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZChzdGF0cy5tb29kKTsKICB9CgogIC8vIC0tLS0gcG9pbnRlciAtLS0tCiAgbGV0IGRvd24gPSBudWxsOwogIGZ1bmN0aW9uIGxvY2FsKGUpIHsgY29uc3QgciA9IEMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7IHJldHVybiB7IHg6IGUuY2xpZW50WCAtIHIubGVmdCwgeTogZS5jbGllbnRZIC0gci50b3AgfTsgfQogIGZ1bmN0aW9uIG9uUGV0KHB0KSB7IHJldHVybiBwdC54ID4gcGV0LnggLSA4ICogVSAmJiBwdC54IDwgcGV0LnggKyA4ICogVSAmJiBwdC55ID4gcGV0LnkgLSAxMSAqIFUgJiYgcHQueSA8IHBldC55ICsgVTsgfQoKICBDLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZSA9PiB7CiAgICBjb25zdCBwdCA9IGxvY2FsKGUpOwogICAgZG93biA9IHsgLi4ucHQsIGhpdDogb25QZXQocHQpLCBtb3ZlZDogZmFsc2UsIGlkOiBlLnBvaW50ZXJJZCwgbGFzdFk6IHB0LnksIHZ5OiAwIH07CiAgICBDLnNldFBvaW50ZXJDYXB0dXJlKGUucG9pbnRlcklkKTsKICB9KTsKICBDLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgZSA9PiB7CiAgICBpZiAoIWRvd24pIHJldHVybjsKICAgIGNvbnN0IHB0ID0gbG9jYWwoZSk7CiAgICBpZiAoIWRvd24ubW92ZWQgJiYgTWF0aC5oeXBvdChwdC54IC0gZG93bi54LCBwdC55IC0gZG93bi55KSA+IDYpIHsKICAgICAgZG93bi5tb3ZlZCA9IHRydWU7CiAgICAgIGlmIChkb3duLmhpdCkgeyB0b3VjaCgpOyBzZXRTdGF0ZSgnaGVsZCcpOyBzYXkocGljayhMSU5FUy5oZWxkKSwgMS42KTsgfQogICAgfQogICAgaWYgKHBldC5zdGF0ZSA9PT0gJ2hlbGQnICYmIGRvd24uaGl0KSB7CiAgICAgIHBldC54ID0gY2xhbXAocHQueCwgNTAsIFcgLSA1MCk7CiAgICAgIHBldC55ID0gY2xhbXAocHQueSArIDUgKiBVLCAxMSAqIFUsIGZsb29yKTsKICAgICAgZG93bi52eSA9IChwdC55IC0gZG93bi5sYXN0WSk7IGRvd24ubGFzdFkgPSBwdC55OwogICAgfQogIH0pOwogIEMuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgZSA9PiB7CiAgICBpZiAoIWRvd24pIHJldHVybjsKICAgIGNvbnN0IHB0ID0gbG9jYWwoZSk7CiAgICBpZiAocGV0LnN0YXRlID09PSAnaGVsZCcpIHsgcGV0LnZ5ID0gY2xhbXAoZG93bi52eSAqIDMwLCAtMzAwLCA2MDApOyBzZXRTdGF0ZSgnZmFsbCcpOyB9CiAgICBlbHNlIGlmICghZG93bi5tb3ZlZCkgewogICAgICBpZiAoZG93bi5oaXQpIHBldEhlYWQoKTsKICAgICAgZWxzZSBpZiAoIVsnZmFsbCcsICdqdW1wJywgJ2VhdCddLmluY2x1ZGVzKHBldC5zdGF0ZSkpIHsKICAgICAgICB0b3VjaCgpOwogICAgICAgIGlmIChwZXQuc3RhdGUgPT09ICdzbGVlcCcpIHNheShwaWNrKExJTkVTLndha2UpKTsKICAgICAgICBlbHNlIHNheShwaWNrKExJTkVTLmNvbWUpLCAxLjQpOwogICAgICAgIHBldC50YXJnZXQgPSBjbGFtcChwdC54LCA2MCwgVyAtIDYwKTsgc2V0U3RhdGUoJ3dhbGsnKTsKICAgICAgfQogICAgfQogICAgZG93biA9IG51bGw7CiAgfSk7CiAgQy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyY2FuY2VsJywgKCkgPT4geyBpZiAocGV0LnN0YXRlID09PSAnaGVsZCcpIHNldFN0YXRlKCdmYWxsJyk7IGRvd24gPSBudWxsOyB9KTsKCiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkZlZWQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZlZWQpOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5QZXQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBldEhlYWQpOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5KdW1wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBqdW1wKTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuU2xlZXAnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNsZWVwKTsKCiAgLy8gLS0tLSBsb29wIC0tLS0KICByZWFkQ29sb3JzKCk7CiAgbmV3IFJlc2l6ZU9ic2VydmVyKHJlc2l6ZSkub2JzZXJ2ZShtb25pdG9yKTsKICByZXNpemUoKTsKICBwZXQueCA9IFcgLyAyOyBwZXQueSA9IGZsb29yOwogIG1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCByZWFkQ29sb3JzKTsKICBuZXcgTXV0YXRpb25PYnNlcnZlcihyZWFkQ29sb3JzKS5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6IFsnZGF0YS10aGVtZSddIH0pOwogIGRvY3VtZW50LmZvbnRzICYmIGRvY3VtZW50LmZvbnRzLnJlYWR5LnRoZW4ocmVhZENvbG9ycyk7CgogIGlmIChJTklULnNsZWVweSkgc2V0U3RhdGUoJ3NsZWVwJyk7CiAgaWYgKElOSVQuYWN0aW9uID09PSAnZmVlZCcpIHsgZmVlZCgpOyBmZWVkKCk7IH0KICBlbHNlIGlmIChJTklULmFjdGlvbiA9PT0gJ3BldCcpIHNldFRpbWVvdXQocGV0SGVhZCwgMzAwKTsKICBlbHNlIHNheShJTklULnNsZWVweSA/ICfllJTigKbov5nkuYjmmZrov5jkuI3nnaHvvJ8nIDogJ+WXqO+8geaIkeaYryBDbGF3ZO+9nicsIDIuNik7CiAgbGV0IGxhc3QgPSBwZXJmb3JtYW5jZS5ub3coKSwgYWNjID0gMDsKICBmdW5jdGlvbiBmcmFtZShub3cpIHsKICAgIGNvbnN0IGR0ID0gTWF0aC5taW4oKG5vdyAtIGxhc3QpIC8gMTAwMCwgMC4wNSk7IGxhc3QgPSBub3c7CiAgICB1cGRhdGUoZHQpOyBkcmF3U2NlbmUoKTsKICAgIGFjYyArPSBkdDsgaWYgKGFjYyA+IDAuNSkgeyBhY2MgPSAwOyByZW5kZXJTdGF0cygpOyB9CiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpOwogIH0KICByZW5kZXJTdGF0cygpOwogIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7Cn0pKCk7Cjwvc2NyaXB0Pgo8L2JvZHk+CjwvaHRtbD4K";

const BODY = new Color("#D97757");
const LEG = new Color("#C4664A");
const EYE = new Color("#1B1411");
const HEART = new Color("#E46F8F");
const BG = Color.dynamic(new Color("#F6F0EA"), new Color("#1D1A18"));
const FG = Color.dynamic(new Color("#2A2320"), new Color("#F1ECE8"));
const MUTED = Color.dynamic(new Color("#8A7B72"), new Color("#A39A93"));
const FOOD_C = new Color("#E0A24A");
const MOOD_C = new Color("#E46F8F");
const TRACK = Color.dynamic(new Color("#E6DCD3"), new Color("#3A3431"));
const BTN = Color.dynamic(new Color("#FFFFFF"), new Color("#2C2725"));
const ACCENT = new Color("#D97757");

function runURL(action) {
  return `scriptable:///run/${encodeURIComponent(Script.name())}?action=${action}`;
}

// ---------- 存档 ----------
const fm = FileManager.local();
const statePath = fm.joinPath(fm.documentsDirectory(), "clawd-state.json");

function loadState() {
  let s = { food: 70, mood: 70, t: Date.now(), lastAction: null, lastActionAt: 0 };
  if (fm.fileExists(statePath)) {
    try { s = Object.assign(s, JSON.parse(fm.readString(statePath))); } catch (e) {}
  }
  // 按经过的时间扣饱腹和心情
  const hours = Math.max(0, (Date.now() - s.t) / 3600000);
  s.food = clamp(s.food - hours * 4, 0, 100);
  s.mood = clamp(s.mood - hours * 3, 0, 100);
  s.t = Date.now();
  return s;
}
function saveState(s) { fm.writeString(statePath, JSON.stringify(s)); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ---------- 根据状态决定表情和台词 ----------
function mood(s) {
  const now = new Date();
  const h = now.getHours();
  const recent = Date.now() - s.lastActionAt < 15 * 60 * 1000;

  if (recent && s.lastAction === "eat") return { face: "happy", heart: true, line: pick(["好吃！谢谢投喂", "嚼嚼嚼…", "饼干最棒了"]) };
  if (recent && s.lastAction === "pet") return { face: "happy", heart: true, line: pick(["嘿嘿～", "再摸一下嘛", "被摸头了！"]) };
  if (h >= 23 || h < 7) return { face: "sleep", zzz: true, line: pick(["zzZ…", "梦到饼干了…", "明天再写代码…"]) };
  if (s.food < 30) return { face: "normal", line: pick(["饿饿…点我喂饼干", "肚子咕咕叫", "有饼干吗…"]) };
  if (s.mood < 30) return { face: "normal", line: pick(["好久没人摸我了…", "点我一下嘛", "有点无聊…"]) };

  const timeLines = [];
  if (h >= 7 && h < 10) timeLines.push("早上好！", "今天也要加油");
  if (h >= 11 && h < 13) timeLines.push("该吃午饭啦", "午饭吃什么？");
  if (h >= 17 && h < 19) timeLines.push("快下班了吗？");
  if (h >= 21) timeLines.push("早点休息哦", "该收工啦");
  const general = ["git push 了吗？", "测试都过了吗", "喝口水吧", "我在看着你哦", "记得休息眼睛", "今天也要加油写代码"];
  const line = pick(timeLines.length && Math.random() < 0.6 ? timeLines : general);
  return { face: s.mood > 75 ? "happy" : (Math.random() < 0.2 ? "blink" : "normal"), heart: s.mood > 85, line };
}

// ---------- 画 Clawd ----------
function drawClawd(m, u) {
  const W = 18, H = 13; // 单位：像素格
  const ctx = new DrawContext();
  ctx.size = new Size(W * u, H * u);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const ox = 9, floor = 12.5;
  const r = (x, y, w, h, c) => { ctx.setFillColor(c); ctx.fillRect(new Rect((ox + x) * u, y * u, w * u, h * u)); };

  const sleep = m.face === "sleep";
  const legH = sleep ? 0.8 : 2;
  const top = floor - legH - 7;

  // 腿
  [-5, -3, 2, 4].forEach(c => r(c, floor - legH, 1, legH, LEG));
  // 身体
  r(-6, top, 12, 7, BODY);
  // 手
  const wave = m.face === "happy";
  r(-7, top + 3 - (wave ? 1 : 0), 1, 2, BODY);
  r(6, top + 3, 1, 2, BODY);
  // 眼睛
  [-4, 3].forEach(c => {
    const ey = top + 2;
    if (sleep) r(c - 0.25, ey + 1.5, 1.5, 0.5, EYE);
    else if (m.face === "happy") {
      r(c - 0.5, ey + 1, 0.5, 0.5, EYE);
      r(c, ey + 0.5, 1, 0.5, EYE);
      r(c + 1, ey + 1, 0.5, 0.5, EYE);
    } else if (m.face === "blink") r(c, ey + 1.25, 1, 0.5, EYE);
    else r(c, ey, 1, 2, EYE);
  });
  // 爱心
  if (m.heart) {
    const hx = 6, hy = 0.3, k = 0.6;
    const hr = (x, y, w, h) => r(hx + x * k, hy + y * k, w * k, h * k, HEART);
    hr(-2, 0, 1.5, 1); hr(0.5, 0, 1.5, 1); hr(-2.5, 1, 5, 1); hr(-2, 2, 4, 1); hr(-1, 3, 2, 1);
  }
  // zzz
  if (m.zzz) {
    ctx.setTextColor(MUTED);
    ctx.setFont(Font.boldMonospacedSystemFont(u * 1.6));
    ctx.drawText("z", new Point((ox + 6) * u, top * u - u * 2.2));
    ctx.setFont(Font.boldMonospacedSystemFont(u * 1.2));
    ctx.drawText("z", new Point((ox + 7.6) * u, top * u - u * 3.6));
  }
  return ctx.getImage();
}

function drawBar(value, color, w, h) {
  const ctx = new DrawContext();
  ctx.size = new Size(w, h);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  const path = (x, wd, c) => {
    const p = new Path();
    p.addRoundedRect(new Rect(x, 0, wd, h), h / 2, h / 2);
    ctx.addPath(p); ctx.setFillColor(c); ctx.fillPath();
  };
  path(0, w, TRACK);
  if (value > 0) path(0, Math.max(h, w * value / 100), color);
  return ctx.getImage();
}

// ---------- 组装小组件 ----------
function statRow(parent, label, value, color, barW) {
  const row = parent.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  const t = row.addText(label);
  t.font = Font.mediumSystemFont(11);
  t.textColor = MUTED;
  row.addSpacer(6);
  const img = row.addImage(drawBar(value, color, barW, 7));
  img.imageSize = new Size(barW, 7);
  row.addSpacer(6);
  const n = row.addText(String(Math.round(value)));
  n.font = Font.boldMonospacedSystemFont(11);
  n.textColor = FG;
}

function addButton(parent, label, url, primary) {
  const b = parent.addStack();
  b.url = url;
  b.backgroundColor = primary ? ACCENT : BTN;
  b.cornerRadius = 9;
  b.setPadding(6, 4, 6, 4);
  b.addSpacer();
  const t = b.addText(label);
  t.font = Font.semiboldSystemFont(12);
  t.textColor = primary ? Color.white() : FG;
  t.lineLimit = 1;
  t.minimumScaleFactor = 0.7;
  b.addSpacer();
}

function buildWidget(s, family) {
  const m = mood(s);
  const w = new ListWidget();
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

  // 锁屏小组件
  if (family && family.startsWith("accessory")) {
    if (family === "accessoryInline") {
      w.addText(`Clawd · ${m.line}`);
    } else if (family === "accessoryCircular") {
      const img = w.addImage(drawClawd(m, 4));
      img.centerAlignImage();
    } else {
      const row = w.addStack();
      row.centerAlignContent();
      const img = row.addImage(drawClawd(m, 3));
      img.imageSize = new Size(44, 32);
      row.addSpacer(6);
      const col = row.addStack();
      col.layoutVertically();
      const a = col.addText("Clawd");
      a.font = Font.boldSystemFont(13);
      const b = col.addText(m.line);
      b.font = Font.systemFont(11);
      b.lineLimit = 2;
      b.minimumScaleFactor = 0.8;
    }
    return w;
  }

  w.backgroundColor = BG;

  if (family === "small") {
    w.setPadding(12, 12, 12, 12);
    const top = w.addStack();
    const name = top.addText("CLAWD");
    name.font = Font.boldMonospacedSystemFont(12);
    name.textColor = FG;
    top.addSpacer();
    const st = top.addText(s.food < 30 ? "饿了" : (m.face === "sleep" ? "睡觉" : "在线"));
    st.font = Font.mediumSystemFont(10);
    st.textColor = MUTED;

    w.addSpacer();
    const imgRow = w.addStack();
    imgRow.addSpacer();
    const img = imgRow.addImage(drawClawd(m, 6));
    img.imageSize = new Size(90, 65);
    imgRow.addSpacer();
    w.addSpacer();

    const line = w.addText(m.line);
    line.font = Font.mediumSystemFont(12);
    line.textColor = FG;
    line.lineLimit = 2;
    line.minimumScaleFactor = 0.8;
    line.centerAlignText();
    return w;
  }

  // 中号 / 大号
  const big = family === "large";
  w.url = runURL("play");
  w.setPadding(12, 14, 12, 14);
  const row = w.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  const img = row.addImage(drawClawd(m, 8));
  img.imageSize = big ? new Size(150, 108) : new Size(100, 72);
  row.addSpacer(14);

  const col = row.addStack();
  col.layoutVertically();
  const name = col.addText("CLAWD");
  name.font = Font.boldMonospacedSystemFont(15);
  name.textColor = FG;
  col.addSpacer(4);
  const line = col.addText(m.line);
  line.font = Font.mediumSystemFont(13);
  line.textColor = FG;
  line.lineLimit = 2;
  line.minimumScaleFactor = 0.8;
  col.addSpacer(8);
  statRow(col, "饱腹", s.food, FOOD_C, 70);
  col.addSpacer(4);
  statRow(col, "心情", s.mood, MOOD_C, 70);

  if (big) {
    w.addSpacer(12);
    const tip = w.addText("点 Clawd 可以陪它玩：拖起来、喂饼干、摸摸头");
    tip.font = Font.systemFont(11);
    tip.textColor = MUTED;
  }
  w.addSpacer();
  const btns = w.addStack();
  btns.layoutHorizontally();
  addButton(btns, "🍪 喂饼干", runURL("feed"), false);
  btns.addSpacer(8);
  addButton(btns, "🤚 摸摸", runURL("pet"), false);
  btns.addSpacer(8);
  addButton(btns, "✨ 打开 Claude", CLAUDE_URL, true);
  return w;
}

// ---------- 完整版桌宠（可交互） ----------
function applyAction(s, action) {
  if (action === "feed") { s.food = clamp(s.food + 25, 0, 100); s.mood = clamp(s.mood + 5, 0, 100); s.lastAction = "eat"; s.lastActionAt = Date.now(); }
  if (action === "pet") { s.mood = clamp(s.mood + 15, 0, 100); s.lastAction = "pet"; s.lastActionAt = Date.now(); }
}

async function play(s, action) {
  const h = new Date().getHours();
  const init = { food: s.food, mood: s.mood, action: action || null, sleepy: !action && (h >= 23 || h < 7) };
  const html = Data.fromBase64String(PET_HTML_B64).toRawString().replace("/*CLAWD_INIT*/null", JSON.stringify(init));
  const wv = new WebView();
  await wv.loadHTML(html);
  await wv.present(true);
  try {
    const r = JSON.parse(await wv.evaluateJavaScript("window.clawdStats()"));
    s.food = clamp(r.food, 0, 100);
    s.mood = clamp(r.mood, 0, 100);
    if (r.lastAction) { s.lastAction = r.lastAction; s.lastActionAt = Date.now(); }
  } catch (e) {
    applyAction(s, action); // 读不到页面里的数值时，至少记下这次投喂 / 摸摸
  }
}

// ---------- 运行 ----------
const state = loadState();
const action = (args.queryParameters || {}).action;

if (config.runsInWidget) {
  saveState(state);
  Script.setWidget(buildWidget(state, config.widgetFamily));
} else if (action === "feed" || action === "pet" || action === "play") {
  await play(state, action === "play" ? null : action);
  saveState(state);
} else {
  // 小号小组件、锁屏小组件或在 App 里直接运行：弹出菜单
  const a = new Alert();
  a.title = "Clawd";
  a.message = `饱腹 ${Math.round(state.food)} · 心情 ${Math.round(state.mood)}\n想对它做点什么？`;
  a.addAction("🎮 陪它玩");
  a.addAction("🍪 投喂饼干");
  a.addAction("🤚 摸摸头");
  a.addAction("✨ 打开 Claude");
  a.addCancelAction("走开");
  const i = await a.presentSheet();
  if (i === 0) await play(state, null);
  if (i === 1) await play(state, "feed");
  if (i === 2) await play(state, "pet");
  if (i === 3) Safari.open(CLAUDE_URL);
  saveState(state);
}
Script.complete();
