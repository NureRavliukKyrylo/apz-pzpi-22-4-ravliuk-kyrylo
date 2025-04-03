package com.example.apzandroid.adapters

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R

class StationScheduleAdapter(private val stations: List<Pair<String, String>>) : RecyclerView.Adapter<StationScheduleAdapter.StationViewHolder>() {

    private val TAG = "StationScheduleAdapter"

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StationViewHolder {
        Log.d(TAG, "onCreateViewHolder: створення нового елемента для RecyclerView")
        val view = LayoutInflater.from(parent.context).inflate(R.layout.schedule_station_item, parent, false)
        return StationViewHolder(view)
    }

    override fun onBindViewHolder(holder: StationViewHolder, position: Int) {
        Log.d(TAG, "onBindViewHolder: прив'язка даних до елемента на позиції $position")

        if (stations.isNullOrEmpty()) {
            Log.w(TAG, "onBindViewHolder: список станцій порожній")
        } else {
            val (stationName, time) = stations[position]
            holder.stationNameTextView.text = stationName
            holder.collectionTimeTextView.text = time
            Log.d(TAG, "onBindViewHolder: назва станції $stationName, час збору $time")
        }
    }

    override fun getItemCount(): Int {
        Log.d(TAG, "getItemCount: кількість елементів у списку - ${stations.size}")
        return stations.size
    }

    class StationViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val stationNameTextView: TextView = itemView.findViewById(R.id.stationScheduleName)
        val collectionTimeTextView: TextView = itemView.findViewById(R.id.collectionTime)
    }
}
