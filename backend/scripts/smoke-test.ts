const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function runSmokeTest() {
  console.log(`Starting FixIt Backend Smoke Test against ${BASE_URL}...\n`);
  let passedCount = 0;
  let failedCount = 0;

  async function step(name: string, fn: () => Promise<boolean>) {
    try {
      const ok = await fn();
      if (ok) {
        console.log(`[PASS] ${name}`);
        passedCount++;
      } else {
        console.log(`[FAIL] ${name}`);
        failedCount++;
      }
    } catch (err: any) {
      console.log(`[FAIL] ${name} - Exception: ${err.message}`);
      failedCount++;
    }
  }

  let customerToken = '';
  let workerToken = '';
  let acServiceId = '';
  let workerId = '';
  let bookingId = '';

  // 1. Customer login
  await step('Customer login', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@fixit.demo', password: 'Fixit@123' }),
    });
    const body: any = await res.json();
    if (res.status === 200 && body.success && body.data?.token) {
      customerToken = body.data.token;
      return true;
    }
    return false;
  });

  // Fetch AC Repair service ID
  await step('Fetch AC Repair service ID', async () => {
    const res = await fetch(`${BASE_URL}/api/services`);
    const body: any = await res.json();
    if (res.status === 200 && body.success && Array.isArray(body.data)) {
      const acService = body.data.find((s: any) => s.name.toLowerCase() === 'ac repair');
      if (acService) {
        acServiceId = acService._id;
        return true;
      }
    }
    return false;
  });

  // 2. Nearby AC Repair (expects >=1 result with distance)
  await step('Nearby AC Repair (expects >=1 result with distance)', async () => {
    const res = await fetch(
      `${BASE_URL}/api/workers/nearby?service=AC%20Repair&latitude=11.1085&longitude=77.3411&radius=10000`,
      {
        headers: { Authorization: `Bearer ${customerToken}` },
      }
    );
    const body: any = await res.json();
    if (
      res.status === 200 &&
      body.success &&
      Array.isArray(body.data) &&
      body.data.length >= 1 &&
      body.data[0].distance !== undefined
    ) {
      workerId = body.data[0].id;
      return true;
    }
    return false;
  });

  // 3. Create booking
  await step('Create booking', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        workerId,
        serviceId: acServiceId,
        description: 'AC is not cooling properly and making noise',
        latitude: 11.1085,
        longitude: 77.3411,
        address: '123 Main St, Tiruppur',
        scheduledDate: '2026-10-01',
        scheduledTime: '10:00 AM',
      }),
    });
    const body: any = await res.json();
    if (res.status === 201 && body.success && body.data?._id) {
      bookingId = body.data._id;
      return true;
    }
    return false;
  });

  // 4. Worker login
  await step('Worker login', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'worker@fixit.demo', password: 'Fixit@123' }),
    });
    const body: any = await res.json();
    if (res.status === 200 && body.success && body.data?.token) {
      workerToken = body.data.token;
      return true;
    }
    return false;
  });

  // 5. Worker sees pending
  await step('Worker sees pending', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings?status=PENDING`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const body: any = await res.json();
    if (res.status === 200 && body.success && Array.isArray(body.data)) {
      return body.data.some((b: any) => b._id === bookingId);
    }
    return false;
  });

  // 6. Accept booking
  await step('Accept booking', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const body: any = await res.json();
    return res.status === 200 && body.success && body.data?.status === 'ACCEPTED';
  });

  // 7. Start booking
  await step('Start booking', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/start`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const body: any = await res.json();
    return res.status === 200 && body.success && body.data?.status === 'STARTED';
  });

  // 8. Complete booking
  await step('Complete booking', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const body: any = await res.json();
    return res.status === 200 && body.success && body.data?.status === 'COMPLETED';
  });

  // 9. Customer reviews
  await step('Customer reviews', async () => {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        bookingId,
        rating: 5,
        comment: 'Excellent AC repair service!',
      }),
    });
    const body: any = await res.json();
    return res.status === 201 && body.success;
  });

  // 10. Worker rating updated
  await step('Worker rating updated', async () => {
    const res = await fetch(`${BASE_URL}/api/workers/${workerId}`);
    const body: any = await res.json();
    return res.status === 200 && body.success && body.data?.rating > 0 && body.data?.reviewCount >= 1;
  });

  // 11. Duplicate review returns 409
  await step('Duplicate review returns 409', async () => {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        bookingId,
        rating: 4,
        comment: 'Second review attempt',
      }),
    });
    return res.status === 409;
  });

  // 12. Invalid transition (complete->start) returns 400
  await step('Invalid transition (complete->start) returns 400', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/start`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    return res.status === 400;
  });

  // 13. Customer calling worker-only endpoint returns 403
  await step('Customer calling worker-only endpoint returns 403', async () => {
    const res = await fetch(`${BASE_URL}/api/workers/me/stats`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    return res.status === 403;
  });

  console.log(`\nSmoke Test Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSmokeTest();
