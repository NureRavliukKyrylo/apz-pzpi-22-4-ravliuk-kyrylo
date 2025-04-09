package com.example.apzandroid.helpers.schedules

import com.example.apzandroid.models.schedules.ScheduleResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

object ScheduleHelper {

    fun fetchSchedules(
        csrfToken: String,
        onSuccess: (List<ScheduleResponse>) -> Unit,
        onFailure: (String) -> Unit
    ) {
        RetrofitClient.scheduleService.collectionSchedules(csrfToken)
            .enqueue(object : Callback<List<ScheduleResponse>> {
                override fun onResponse(
                    call: Call<List<ScheduleResponse>>,
                    response: Response<List<ScheduleResponse>>
                ) {
                    if (response.isSuccessful) {
                        val schedules = response.body() ?: emptyList()
                        onSuccess(schedules)
                    } else {
                        onFailure("Помилка отримання розкладу: ${response.code()}")
                    }
                }

                override fun onFailure(call: Call<List<ScheduleResponse>>, t: Throwable) {
                    onFailure("Помилка підключення: ${t.message}")
                }
            })
    }
}