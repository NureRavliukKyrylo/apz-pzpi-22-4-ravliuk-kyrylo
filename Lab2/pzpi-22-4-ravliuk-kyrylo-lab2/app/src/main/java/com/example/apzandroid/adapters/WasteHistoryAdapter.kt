package com.example.apzandroid.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.models.waste_history_models.WasteHistoriesResponse
import com.example.apzandroid.utils.DateUtils

class WasteHistoryAdapter(private val wasteHistoryList: List<WasteHistoriesResponse>, private val stationNames: Map<Int, String>) :
    RecyclerView.Adapter<WasteHistoryAdapter.WasteHistoryViewHolder>() {

    class WasteHistoryViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val amountText: TextView = view.findViewById(R.id.amountHistory)
        val dateText: TextView = view.findViewById(R.id.dateHistory)
        val stationText: TextView = view.findViewById(R.id.stetionNameHistory)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): WasteHistoryViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.waste_history_item, parent, false)
        return WasteHistoryViewHolder(view)
    }

    override fun onBindViewHolder(holder: WasteHistoryViewHolder, position: Int) {
        val item = wasteHistoryList[position]
        holder.amountText.text = "${item.amount} volume"
        holder.dateText.text = DateUtils.parseDate(item.recycling_date)
        holder.stationText.text = stationNames[item.station_id] ?: "Unknown station"
    }

    override fun getItemCount(): Int = wasteHistoryList.size
}
