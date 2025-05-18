package com.example.apzandroid.fragments

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.ProgressBar
import android.widget.SearchView
import android.widget.Spinner
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.StationAdapter
import com.example.apzandroid.helpers.stations.StationHelper
import com.example.apzandroid.models.station_models.StationStatusResponse
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.utils.CsrfTokenManager

class StationsFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: StationAdapter
    private lateinit var searchView: SearchView
    private lateinit var spinnerStatuses: Spinner
    private lateinit var progressBar: ProgressBar
    private var csrfToken: String = ""
    private val handler = Handler(Looper.getMainLooper())
    private var searchRunnable: Runnable? = null
    private var statusesList: List<StationStatusResponse> = emptyList()

    private var currentSearchQuery: String? = null
    private var currentStatusId: Int? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.stations_view, container, false)

        recyclerView = view.findViewById(R.id.recyclerStations)
        searchView = view.findViewById(R.id.searchViewStations)
        spinnerStatuses = view.findViewById(R.id.spinnerStatuses)
        progressBar = view.findViewById(R.id.progressBar)

        csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()
        recyclerView.layoutManager = LinearLayoutManager(context)
        adapter = StationAdapter(emptyList(), csrfToken)
        recyclerView.adapter = adapter

        setupSearchView()
        setupStatusSpinner()

        loadStations()

        return view
    }

    private fun setupSearchView() {
        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                currentSearchQuery = query
                filterStations()
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                searchRunnable?.let { handler.removeCallbacks(it) }

                searchRunnable = Runnable {
                    currentSearchQuery = newText
                    filterStations()
                }
                handler.postDelayed(searchRunnable!!, 500)

                return true
            }
        })
    }

    private fun setupStatusSpinner() {
        StationHelper.fetchStatuses(
            csrfToken = csrfToken,
            context = requireContext(),
            spinner = spinnerStatuses
        ) { loadedStatuses ->
            statusesList = loadedStatuses

            val allStatusesWithFilter = mutableListOf<StationStatusResponse>()
            allStatusesWithFilter.add(StationStatusResponse(0, "Filter"))
            allStatusesWithFilter.addAll(statusesList)
            statusesList = allStatusesWithFilter

            val adapter = ArrayAdapter(
                requireContext(),
                android.R.layout.simple_spinner_item,
                statusesList.map { it.station_status_name }
            )
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            spinnerStatuses.adapter = adapter

            spinnerStatuses.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                    if (position == 0) {
                        currentStatusId = null
                    } else {
                        val selectedStatus = statusesList[position]
                        currentStatusId = selectedStatus.id
                    }
                    filterStations()
                }

                override fun onNothingSelected(parent: AdapterView<*>) {
                    currentStatusId = null
                    filterStations()
                }
            }
        }
    }


    private fun loadStations() {
        progressBar.visibility = View.VISIBLE
        StationHelper.loadStations(csrfToken, { stationsList ->
            handler.postDelayed({
                progressBar.visibility = View.GONE
                adapter.updateData(stationsList)
            }, 2000)
        }, { error ->
            handler.postDelayed({
                progressBar.visibility = View.GONE
                Toast.makeText(context, error, Toast.LENGTH_SHORT).show()
            }, 2000)
        })
    }

    private fun filterStations() {
        progressBar.visibility = View.VISIBLE

        StationHelper.loadFilteredStations(
            csrfToken = csrfToken,
            search = currentSearchQuery,
            statusId = if (currentStatusId == 0) null else currentStatusId,
            onSuccess = { filteredList ->
                progressBar.visibility = View.GONE
                adapter.updateData(filteredList)
            },
            onError = { error ->
                progressBar.visibility = View.GONE
                Toast.makeText(context, error, Toast.LENGTH_SHORT).show()
            }
        )
    }

}


