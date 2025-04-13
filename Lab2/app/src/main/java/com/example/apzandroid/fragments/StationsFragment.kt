package com.example.apzandroid.fragments

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.SearchView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.StationAdapter
import com.example.apzandroid.helpers.stations.StationHelper
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.utils.CsrfTokenManager

class StationsFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: StationAdapter
    private lateinit var searchView: SearchView
    private var csrfToken: String = ""
    private val handler = Handler(Looper.getMainLooper())
    private var searchRunnable: Runnable? = null
    private lateinit var progressBar: ProgressBar

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.stations_view, container, false)
        recyclerView = view.findViewById(R.id.recyclerStations)
        searchView = view.findViewById(R.id.searchViewStations)
        progressBar = view.findViewById(R.id.progressBar)

        csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()
        recyclerView.layoutManager = LinearLayoutManager(context)

        val emptyList = emptyList<StationsResponse>()
        adapter = StationAdapter(emptyList, csrfToken)
        recyclerView.adapter = adapter

        loadStations()

        setupSearchView()

        return view
    }

    private fun loadStations() {
        progressBar.visibility = View.VISIBLE

        StationHelper.loadStations(csrfToken, { stationsList ->
            progressBar.visibility = View.GONE
            adapter.updateData(stationsList)
        }, { error ->
            progressBar.visibility = View.GONE
            Toast.makeText(context, error, Toast.LENGTH_SHORT).show()
        })
    }

    private fun setupSearchView() {
        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                if (!query.isNullOrEmpty()) {
                    searchStations(query)
                }
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                searchRunnable?.let { handler.removeCallbacks(it) }

                if (newText.isNullOrEmpty()) {
                    loadStations()
                } else {
                    searchRunnable = Runnable {
                        searchStations(newText)
                    }
                    handler.postDelayed(searchRunnable!!, 500)
                }

                return true
            }
        })
    }

    private fun searchStations(keyword: String) {
        StationHelper.searchStations(csrfToken, keyword, { stationsList ->
            adapter.updateData(stationsList)
        }, { error ->
            Toast.makeText(context, error, Toast.LENGTH_SHORT).show()
        })
    }
}


