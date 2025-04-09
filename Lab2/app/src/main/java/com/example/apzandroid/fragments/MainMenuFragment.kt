package com.example.apzandroid.fragments

import android.content.Context.MODE_PRIVATE
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.cardview.widget.CardView
import androidx.fragment.app.Fragment
import com.example.apzandroid.R
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainMenuFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.main_menu_content, container, false)

        val profileCard = view.findViewById<CardView>(R.id.profile_view)
        val stationsCard = view.findViewById<CardView>(R.id.stations_card_view)
        val mapCard = view.findViewById<CardView>(R.id.map_interactive)
        val scheduleCard = view.findViewById<CardView>(R.id.schedule_card)
        val historyCard = view.findViewById<CardView>(R.id.history_card_view)
        val bottomNav = requireActivity().findViewById<BottomNavigationView>(R.id.bottom_navigation)
        val nav_item_operator = bottomNav.menu.findItem(R.id.nav_operator)

        val prefs = context?.getSharedPreferences("app_prefs", MODE_PRIVATE)
        val role = prefs?.getString("user_role", "")

        if (role == "Customer") {
            nav_item_operator.isVisible = false
        }

        profileCard.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, ProfileFragment())
                .addToBackStack(null)
                .commit()
        }

        stationsCard.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, StationsFragment())
                .addToBackStack(null)
                .commit()
        }

        mapCard.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, MapFragment())
                .addToBackStack(null)
                .commit()
        }

        scheduleCard.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, ScheduleFragment())
                .addToBackStack(null)
                .commit()
        }

        historyCard.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, WasteHistoryFragment())
                .addToBackStack(null)
                .commit()
        }

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_operator -> {
                    parentFragmentManager.beginTransaction()
                        .replace(R.id.fragment_container, OperatorPageFragment())
                        .addToBackStack(null)
                        .commit()
                    true
                }
                R.id.nav_notifications -> {
                    parentFragmentManager.beginTransaction()
                        .replace(R.id.fragment_container, NotificationsFragment())
                        .addToBackStack(null)
                        .commit()
                    true
                }
                else -> false
            }
        }

        return view
    }
}
