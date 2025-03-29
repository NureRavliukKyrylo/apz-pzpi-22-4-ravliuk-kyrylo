package com.example.apzandroid.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.cardview.widget.CardView
import androidx.fragment.app.Fragment
import com.example.apzandroid.R

class MainMenuFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.main_menu_content, container, false)

        val profileCard = view.findViewById<CardView>(R.id.profile_view)
        val stationsCard = view.findViewById<CardView>(R.id.stations_card_view)
        val mapCard = view.findViewById<CardView>(R.id.map_interactive)

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

        return view
    }
}
