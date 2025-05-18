import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl

class SessionCookie : CookieJar {
    private val cookieStore = mutableMapOf<String, MutableList<Cookie>>()

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        cookieStore[url.host] = cookies.toMutableList()
        println("Saved cookies for ${url.host}:")
        cookies.forEach { println(" - ${it.name}=${it.value}") }
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        val cookies = cookieStore[url.host] ?: emptyList()
        println("Loading cookies for ${url.host}:")
        cookies.forEach { println(" - ${it.name}=${it.value}") }
        return cookies
    }
}

