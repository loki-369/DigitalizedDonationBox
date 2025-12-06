package com.example.donationbox.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.donationbox.databinding.FragmentAdminDashboardBinding

import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.firstOrNull

class AdminDashboardFragment : Fragment() {

    private var _binding: FragmentAdminDashboardBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val db = com.example.donationbox.data.AppDatabase.getDatabase(requireContext())
        val dao = db.donationDao()
        
        // Observe Total Amount
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(androidx.lifecycle.Lifecycle.State.STARTED) {
                dao.getTotalAmount().collect { total ->
                    binding.tvTotalAmount.text = String.format(java.util.Locale.US, "₹ %.2f", total ?: 0.0)
                }
            }
        }
        
        // TODO: Setup RecyclerView for list
        
        binding.btnExportCsv.setOnClickListener {
            exportToCsv(dao)
        }
    }

    private fun exportToCsv(dao: com.example.donationbox.data.DonationDao) {
        viewLifecycleOwner.lifecycleScope.launch {
            val donations = dao.getAllDonations().firstOrNull() ?: emptyList()
            val sb = StringBuilder()
            sb.append("ID,Amount,Currency,Type,Timestamp\n")
            for (d in donations) {
                sb.append("${d.id},${d.amount},${d.currency},${d.type},${java.util.Date(d.timestamp)}\n")
            }
            
            try {
                val file = java.io.File(requireContext().getExternalFilesDir(null), "donations.csv")
                val writer = java.io.FileWriter(file)
                writer.append(sb.toString())
                writer.flush()
                writer.close()
                android.widget.Toast.makeText(context, "Exported to ${file.absolutePath}", android.widget.Toast.LENGTH_LONG).show()
            } catch (e: Exception) {
                e.printStackTrace()
                android.widget.Toast.makeText(context, "Export Failed", android.widget.Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
