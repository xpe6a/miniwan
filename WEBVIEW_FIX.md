# WebView Fix Documentation

## Проблема
Сайт не открывался в мобильных WebView контейнерах (Android/iOS) из-за ограничений безопасности Vercel.

## Решение

### 1. Настройки Vercel (`vercel.json`)
- **X-Frame-Options: ALLOWALL** - разрешает встраивание в iframe/WebView
- **Content-Security-Policy** - добавлен `upgrade-insecure-requests` для автоматического перевода HTTP → HTTPS
- **Access-Control-Allow-Origin: \*** - разрешает CORS запросы
- **Access-Control-Allow-Methods** - разрешает все HTTP методы
- **X-Content-Type-Options: nosniff** - защита от MIME type sniffing

### 2. HTML Meta-теги (`index.html`)
- **viewport** - оптимизирован для мобильных WebView
- **X-UA-Compatible** - совместимость с IE/Edge движками
- **Content-Security-Policy: upgrade-insecure-requests** - автоматическая замена HTTP → HTTPS

## Тестирование

### Android WebView
```kotlin
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
}
webView.loadUrl("https://your-site.vercel.app")
```

### iOS WKWebView
```swift
let config = WKWebViewConfiguration()
let webView = WKWebView(frame: .zero, configuration: config)
webView.load(URLRequest(url: URL(string: "https://your-site.vercel.app")!))
```

## Что исправлено
✅ X-Frame-Options блокировка
✅ Content-Security-Policy ограничения
✅ Mixed Content проблемы
✅ CORS ошибки
✅ Оптимизация для мобильных WebView

## После деплоя
После пуша на Vercel изменения вступят в силу автоматически. Проверьте заголовки ответа:

```bash
curl -I https://your-site.vercel.app
```

Должны появиться новые заголовки из `vercel.json`.

