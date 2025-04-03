package com.example.apzandroid.fragments

import android.graphics.Color
import android.os.Bundle
import android.text.style.ForegroundColorSpan
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.StationScheduleAdapter
import com.example.apzandroid.models.schedules.ScheduleResponse
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.example.apzandroid.utils.DateUtils
import com.prolificinteractive.materialcalendarview.CalendarDay
import com.prolificinteractive.materialcalendarview.DayViewDecorator
import com.prolificinteractive.materialcalendarview.DayViewFacade
import com.prolificinteractive.materialcalendarview.MaterialCalendarView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.*

class ScheduleFragment : Fragment() {
    private lateinit var calendarView: MaterialCalendarView
    private lateinit var stationRecyclerView: RecyclerView
    private val scheduleDates = mutableListOf<CalendarDay>()
    private val stationNamesByDate = mutableMapOf<CalendarDay, List<Pair<String, String>>>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.schedule_view, container, false)
        calendarView = view.findViewById(R.id.materialCalendarView)
        stationRecyclerView = view.findViewById(R.id.testView)

        stationRecyclerView.layoutManager = LinearLayoutManager(context)

        fetchSchedules()

        calendarView.setOnDateChangedListener { _, date, _ ->
            val selectedDate = Calendar.getInstance()
            selectedDate.set(date.year, date.month - 1, date.day)

            val stationNames = stationNamesByDate[date]
            if (stationNames != null && stationNames.isNotEmpty()) {
                stationRecyclerView.adapter = StationScheduleAdapter(stationNames)
            } else {

            }
        }

        return view
    }

    private fun fetchSchedules() {
        val csrfToken = CsrfTokenManager.getCsrfToken(requireContext())

        RetrofitClient.scheduleService.collectionSchedules(csrfToken.toString()).enqueue(object : Callback<List<ScheduleResponse>> {
            override fun onResponse(call: Call<List<ScheduleResponse>>, response: Response<List<ScheduleResponse>>) {
                if (response.isSuccessful) {
                    response.body()?.let { schedules ->
                        for (schedule in schedules) {
                            val formattedDate = DateUtils.parseDate(schedule.collection_date)
                            val dateFormat = SimpleDateFormat("dd MMM yyyy HH:mm", Locale.getDefault())

                            val date = dateFormat.parse(formattedDate)
                            date?.let {
                                val calendar = Calendar.getInstance()
                                calendar.time = it
                                val calendarDay = CalendarDay.from(calendar)

                                val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                                val time = timeFormat.format(it)

                                fetchStationName(schedule.station_of_containers_id) { stationName ->
                                    val currentStationNames = stationNamesByDate[calendarDay]?.toMutableList() ?: mutableListOf()
                                    currentStationNames.add(Pair(stationName, time))
                                    stationNamesByDate[calendarDay] = currentStationNames

                                    scheduleDates.add(calendarDay)
                                    calendarView.addDecorator(GreenDayDecorator(scheduleDates))
                                }
                            }
                        }
                    }
                }
            }

            override fun onFailure(call: Call<List<ScheduleResponse>>, t: Throwable) {
                Log.e("ScheduleFragment", "Помилка отримання розкладу: ${t.message}")
            }
        })
    }

    private fun fetchStationName(stationId: Int, callback: (String) -> Unit) {
        val csrfToken = CsrfTokenManager.getCsrfToken(requireContext())

        RetrofitClient.stationsService.stations(csrfToken.toString()).enqueue(object : Callback<List<StationsResponse>> {
            override fun onResponse(call: Call<List<StationsResponse>>, response: Response<List<StationsResponse>>) {
                if (response.isSuccessful) {
                    val station = response.body()?.find { it.id == stationId }
                    callback(station?.station_of_containers_name ?: "Unknown station")
                } else {
                    callback("Помилка отримання станції")
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                callback("Помилка підключення")
            }
        })
    }
}

class GreenDayDecorator(private val dates: List<CalendarDay>) : DayViewDecorator {
    override fun shouldDecorate(day: CalendarDay): Boolean {
        return dates.contains(day)
    }

    override fun decorate(view: DayViewFacade) {
        view.addSpan(ForegroundColorSpan(Color.GREEN))
    }
}
