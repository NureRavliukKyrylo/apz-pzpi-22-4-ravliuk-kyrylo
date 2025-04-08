import com.example.apzandroid.api.AccountService
import com.example.apzandroid.api.AuthService
import com.example.apzandroid.api.ContainersService
import com.example.apzandroid.api.NotificationService
import com.example.apzandroid.api.ReportService
import com.example.apzandroid.api.ScheduleService
import com.example.apzandroid.api.StationsService
import com.example.apzandroid.api.WasteHistoryService
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:8000/"

    private val client = OkHttpClient.Builder()
        .cookieJar(SessionCookie())
        .build()

    private val gson = GsonBuilder()
        .setLenient() // Додаємо lenient режим
        .create()

    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }


    val authService: AuthService by lazy {
        retrofit.create(AuthService::class.java)
    }

    val accountService: AccountService by lazy{
        retrofit.create(AccountService::class.java)
    }

    val stationsService: StationsService by lazy {
        retrofit.create(StationsService::class.java)
    }

    val containersService: ContainersService by lazy {
        retrofit.create(ContainersService::class.java)
    }

    val scheduleService: ScheduleService by lazy {
        retrofit.create(ScheduleService::class.java)
    }

    val wasteHistoryService: WasteHistoryService by lazy {
        retrofit.create(WasteHistoryService::class.java)
    }

    val notificationService: NotificationService by lazy {
        retrofit.create(NotificationService::class.java)
    }

    val reportService: ReportService by lazy{
        retrofit.create(ReportService::class.java)
    }


}