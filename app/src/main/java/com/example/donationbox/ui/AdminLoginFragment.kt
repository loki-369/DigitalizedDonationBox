package com.example.donationbox.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.donationbox.R
import com.example.donationbox.databinding.FragmentAdminLoginBinding

class AdminLoginFragment : Fragment() {

    private var _binding: FragmentAdminLoginBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        binding.btnLogin.setOnClickListener {
            val password = binding.etPassword.text.toString()
            if (password == "admin123") { // Hardcoded for demo
                parentFragmentManager.beginTransaction()
                    .replace(R.id.fragment_container, AdminDashboardFragment())
                    .addToBackStack(null)
                    .commit()
            } else {
                Toast.makeText(context, "Invalid Password", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
