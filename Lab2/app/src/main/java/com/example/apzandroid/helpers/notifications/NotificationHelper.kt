package com.example.apzandroid.helpers.notifications

import android.content.Context
import com.example.apzandroid.models.notification_models.NotificationTypeResponse
import com.example.apzandroid.models.notification_models.NotificationsResponse
import com.example.apzandroid.utils.ShowToastUtils
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class NotificationHelper {

    companion object {
        fun loadNotifications(
            csrfToken: String,
            context: Context,
            callback: (List<NotificationsResponse>, Map<Int, String>) -> Unit
        ) {
            RetrofitClient.notificationService.notificationsForUser(csrfToken)
                .enqueue(object : Callback<List<NotificationsResponse>> {
                    override fun onResponse(
                        call: Call<List<NotificationsResponse>>,
                        response: Response<List<NotificationsResponse>>
                    ) {
                        if (response.isSuccessful) {
                            val notifications = response.body() ?: emptyList()
                            loadNotificationTypes(notifications, csrfToken, context, callback)
                        } else {
                            ShowToastUtils.showToast(context, "Помилка завантаження сповіщень")
                        }
                    }

                    override fun onFailure(call: Call<List<NotificationsResponse>>, t: Throwable) {
                        ShowToastUtils.showToast(context, "Помилка: ${t.message}")
                    }
                })
        }

        private fun loadNotificationTypes(
            notifications: List<NotificationsResponse>,
            csrfToken: String,
            context: Context,
            callback: (List<NotificationsResponse>, Map<Int, String>) -> Unit
        ) {
            val uniqueTypes = notifications.map { it.notification_type }.distinct()
            var typesLoaded = 0
            val notificationTypesMap = mutableMapOf<Int, String>()

            if (uniqueTypes.isEmpty()) {
                callback(notifications, notificationTypesMap)
                return
            }

            uniqueTypes.forEach { typeId ->
                RetrofitClient.notificationService.notificationTypes(typeId.toString(), csrfToken)
                    .enqueue(object : Callback<NotificationTypeResponse> {
                        override fun onResponse(
                            call: Call<NotificationTypeResponse>,
                            response: Response<NotificationTypeResponse>
                        ) {
                            response.body()?.let {
                                notificationTypesMap[it.id] = it.type_notification_name
                            }
                            typesLoaded++
                            if (typesLoaded == uniqueTypes.size) {
                                callback(notifications, notificationTypesMap)
                            }
                        }

                        override fun onFailure(call: Call<NotificationTypeResponse>, t: Throwable) {
                            typesLoaded++
                            if (typesLoaded == uniqueTypes.size) {
                                callback(notifications, notificationTypesMap)
                            }
                        }
                    })
            }
        }

        fun deleteNotificationById(
            notificationId: Int,
            csrfToken: String,
            context: Context,
            onSuccess: () -> Unit,
            onFailure: () -> Unit
        ) {
            RetrofitClient.notificationService.deleteNotificationById(notificationId, csrfToken)
                .enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            onSuccess()
                            ShowToastUtils.showToast(context, "Успішно Видалено")
                        } else {
                            ShowToastUtils.showToast(context, "Не вдалося видалити")
                            onFailure()
                        }
                    }

                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        ShowToastUtils.showToast(context, "Помилка при видаленні")
                        onFailure()
                    }
                })
        }

    }
}

