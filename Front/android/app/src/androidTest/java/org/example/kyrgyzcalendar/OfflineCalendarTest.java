package org.example.kyrgyzcalendar;

import static org.junit.Assert.*;
import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class OfflineCalendarTest {
    @Test
    public void coldEngineCalculatesUnvisitedYearsWithoutInternetPermission() throws Exception {
        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals(PackageManager.PERMISSION_DENIED,
            context.checkSelfPermission(Manifest.permission.INTERNET));
        Log.i("CalendarOfflineTest", "Starting embedded Python");
        if (!Python.isStarted()) Python.start(new AndroidPlatform(context));
        Log.i("CalendarOfflineTest", "Python ready; importing calendar engine");
        Python python = Python.getInstance();
        com.chaquo.python.PyObject module = python.getModule("calendar_mobile");
        Log.i("CalendarOfflineTest", "Engine imported");
        for (int year : new int[] {2026, 1900, 2050}) {
            Log.i("CalendarOfflineTest", "Calculating " + year);
            JSONObject request = new JSONObject();
            request.put("year", year);
            request.put("latitude", 42.8746);
            request.put("longitude", 74.5698);
            request.put("tz_name", "Asia/Bishkek");
            String json = module.callAttr("calculate", request.toString()).toString();
            Log.i("CalendarOfflineTest", "Calculated " + year);
            JSONObject result = new JSONObject(json);
            assertEquals(year, result.getInt("year"));
            assertTrue(result.getJSONArray("events").length() > 40);
            assertTrue(result.getJSONArray("lunar_months").length() >= 12);
            if (year == 2026) {
                JSONArray events = result.getJSONArray("events");
                int coincident = 0;
                for (int i = 0; i < events.length(); i++) {
                    if (events.getJSONObject(i).getString("date").equals("2026-02-17")) coincident++;
                }
                assertEquals(3, coincident);
            }
        }
    }
}
