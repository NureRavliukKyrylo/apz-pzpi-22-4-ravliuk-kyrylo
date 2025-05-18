package com.example.apzandroid.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.models.notification_models.NotificationsResponse

class NotificationsAdapter(
    private val notifications: List<NotificationsResponse>,
    private val getTypeName: (Int) -> String
) : RecyclerView.Adapter<NotificationsAdapter.NotificationViewHolder>() {

    class NotificationViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val type: TextView = view.findViewById(R.id.notificationType)
        val message: TextView = view.findViewById(R.id.notificationText)
        val time: TextView = view.findViewById(R.id.timeNotification)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotificationViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.notifications_item, parent, false)
        return NotificationViewHolder(view)
    }

    override fun onBindViewHolder(holder: NotificationViewHolder, position: Int) {
        val notification = notifications[position]
        holder.type.text = getTypeName(notification.notification_type)
        holder.message.text = notification.message
        holder.time.text = notification.timestamp_get_notification
    }

    override fun getItemCount(): Int = notifications.size
}
