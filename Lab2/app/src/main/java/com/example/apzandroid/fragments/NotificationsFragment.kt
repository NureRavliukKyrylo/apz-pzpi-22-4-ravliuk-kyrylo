package com.example.apzandroid.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.NotificationsAdapter
import com.example.apzandroid.models.notification_models.NotificationsResponse
import com.example.apzandroid.helpers.notifications.NotificationHelper
import com.example.apzandroid.helpers.notifications.SwipeToDeleteCallback
import com.example.apzandroid.utils.CsrfTokenManager

class NotificationsFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: NotificationsAdapter
    private var csrfToken: String = ""
    private var notificationsList = mutableListOf<NotificationsResponse>()
    private val notificationTypesMap = mutableMapOf<Int, String>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val view = inflater.inflate(R.layout.notifications_page, container, false)
        recyclerView = view.findViewById(R.id.notificationsRecycler)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()

        loadNotifications()
        return view
    }

    private fun loadNotifications() {
        NotificationHelper.loadNotifications(csrfToken, requireContext()) { notifications, typesMap ->
            notificationsList = notifications.toMutableList()
            notificationTypesMap.clear()
            notificationTypesMap.putAll(typesMap)

            adapter = NotificationsAdapter(notificationsList) { typeId ->
                notificationTypesMap[typeId] ?: "Невідомий тип"
            }
            recyclerView.adapter = adapter

            val swipeHandler = SwipeToDeleteCallback(requireContext(), notificationsList, csrfToken) { position ->
                adapter.notifyItemRemoved(position)
            }
            val itemTouchHelper = ItemTouchHelper(swipeHandler)
            itemTouchHelper.attachToRecyclerView(recyclerView)
        }
    }
}


