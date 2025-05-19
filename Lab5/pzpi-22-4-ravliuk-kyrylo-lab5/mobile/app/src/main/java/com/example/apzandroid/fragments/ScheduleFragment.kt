package com.example.apzandroid.fragments

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.StationScheduleAdapter
import com.example.apzandroid.helpers.schedules.ScheduleHelper
import com.example.apzandroid.helpers.stations.StationHelper
import com.example.apzandroid.utils.CsrfTokenManager
import com.example.apzandroid.utils.DateUtils
import com.prolificinteractive.materialcalendarview.CalendarDay
import com.prolificinteractive.materialcalendarview.MaterialCalendarView
import java.text.SimpleDateFormat
import java.util.*
import com.example.apzandroid.helpers.schedules.GreenDayDecorator

class ScheduleFragment : Fragment() {
    private lateinit var calendarView: MaterialCalendarView
    private lateinit var stationRecyclerView: RecyclerView
    private lateinit var nothingFoundTextView: TextView
    private val scheduleDates = mutableListOf<CalendarDay>()
    private val stationNamesByDate = mutableMapOf<CalendarDay, List<Pair<String, String>>>()
    private val stationNames = mutableMapOf<Int, String>()
    private var csrfToken: String = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.schedule_view, container, false)
        calendarView = view.findViewById(R.id.materialCalendarView)
        stationRecyclerView = view.findViewById(R.id.testView)
        nothingFoundTextView = view.findViewById(R.id.nothingFound)
        csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()

        stationRecyclerView.layoutManager = LinearLayoutManager(context)

        fetchSchedules()

        calendarView.setOnDateChangedListener { _, date, _ ->
            val selectedDate = Calendar.getInstance()
            selectedDate.set(date.year, date.month - 1, date.day)

            val stationNamesForDate = stationNamesByDate[date]
            if (stationNamesForDate != null && stationNamesForDate.isNotEmpty()) {
                stationRecyclerView.adapter = StationScheduleAdapter(stationNamesForDate)
                stationRecyclerView.visibility = View.VISIBLE
                nothingFoundTextView.visibility = View.GONE
            } else {
                stationRecyclerView.visibility = View.GONE
                nothingFoundTextView.visibility = View.VISIBLE
            }
        }

        return view
    }

    private fun fetchSchedules() {
        val csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()

        ScheduleHelper.fetchSchedules(
            csrfToken,
            onSuccess = { schedules ->
                for (schedule in schedules) {

                    val stationId = schedule.station_of_containers_id

                    if (stationId == null || stationId == 0) {
                        Log.w("ScheduleFragment", "Скіпнуто запис з stationId = $stationId, дата: ${schedule.collection_date}")
                        continue
                    }

                    val formattedDate = DateUtils.parseDate(schedule.collection_date)
                    val dateFormat = SimpleDateFormat("dd MMM yyyy HH:mm", Locale.getDefault())
                    val date = dateFormat.parse(formattedDate)

                    date?.let {
                        val calendar = Calendar.getInstance()
                        calendar.time = it
                        val calendarDay = CalendarDay.from(calendar)

                        val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                        val time = timeFormat.format(it)

                        val stationId = schedule.station_of_containers_id

                        if (!stationNames.containsKey(stationId)) {
                            fetchStationName(stationId) { stationName ->
                                stationNames[stationId] = stationName

                                val currentList = stationNamesByDate[calendarDay]?.toMutableList() ?: mutableListOf()
                                currentList.add(Pair(stationName, time))
                                stationNamesByDate[calendarDay] = currentList

                                scheduleDates.add(calendarDay)
                                calendarView.addDecorator(GreenDayDecorator(scheduleDates))
                            }
                        } else {
                            val stationName = stationNames[stationId] ?: "Невідома станція"
                            val currentList = stationNamesByDate[calendarDay]?.toMutableList() ?: mutableListOf()
                            currentList.add(Pair(stationName, time))
                            stationNamesByDate[calendarDay] = currentList

                            scheduleDates.add(calendarDay)
                            calendarView.addDecorator(GreenDayDecorator(scheduleDates))
                        }
                    }
                }
            },
            onFailure = { errorMessage ->
                Toast.makeText(requireContext(), errorMessage, Toast.LENGTH_SHORT).show()
            }
        )
    }

    private fun fetchStationName(stationId: Int, callback: (String) -> Unit) {
        StationHelper.fetchStationName(
            csrfToken,
            stationId,
            onSuccess = { stationName ->
                callback(stationName)
            },
            onFailure = { errorMessage ->
                Toast.makeText(requireContext(), errorMessage, Toast.LENGTH_SHORT).show()
                callback("Невідома станція")
            }
        )
    }

}

