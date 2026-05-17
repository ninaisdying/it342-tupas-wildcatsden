package com.example.wildcatsden.bookings.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.wildcatsden.R
import com.example.wildcatsden.bookings.Booking

class BookingAdapter(private var items: List<Booking>) : RecyclerView.Adapter<BookingAdapter.VH>() {

    class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvEvent: TextView = view.findViewById(R.id.tvEventName)
        val tvVenue: TextView = view.findViewById(R.id.tvVenueName)
        val tvDateTime: TextView = view.findViewById(R.id.tvDateTime)
        val tvStatus: TextView = view.findViewById(R.id.tvStatus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_booking, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val b = items[position]
        holder.tvEvent.text = b.eventName ?: "(untitled)"
        holder.tvVenue.text = b.venueName ?: ""

        // Format date/time
        val date = b.date ?: ""
        val time = b.timeSlot ?: ""
        holder.tvDateTime.text = "$date • $time"

        holder.tvStatus.text = b.status ?: ""
    }

    override fun getItemCount(): Int = items.size

    fun update(newItems: List<Booking>) {
        items = newItems
        notifyDataSetChanged()
    }
}
