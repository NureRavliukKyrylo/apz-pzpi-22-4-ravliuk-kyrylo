package com.example.apzandroid.adapters

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R

class StationScheduleAdapter(private val stations: List<Pair<String, String>>) : RecyclerView.Adapter<StationScheduleAdapter.StationViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StationViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.schedule_station_item, parent, false)
        return StationViewHolder(view)
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: StationViewHolder, position: Int) {
         val (stationName, time) = stations[position]
         holder.stationNameTextView.text = stationName
         holder.collectionTimeTextView.text = "Time: $time"
    }

    override fun getItemCount(): Int {
        return stations.size
    }

    class StationViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val stationNameTextView: TextView = itemView.findViewById(R.id.stationScheduleName)
        val collectionTimeTextView: TextView = itemView.findViewById(R.id.collectionTime)
    }
}
